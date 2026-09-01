import * as React from "react"

import { cn } from "@/lib/utils"
import { correlationMatrix } from "@/lib/stats"

export interface CorrelationHeatmapProps {
  labels: string[]
  /** A precomputed correlation matrix… */
  matrix?: number[][]
  /** …or raw equal-length columns to compute Pearson correlations from. */
  columns?: number[][]
  title?: string
  /** Print the coefficient in each cell. Default true. */
  annotate?: boolean
  width?: number
  height?: number
  className?: string
}

/**
 * A correlation matrix heatmap — seaborn's `heatmap(df.corr())`. The diverging
 * color scale is built from theme tokens with `color-mix` (positive →
 * `--chart-1`, negative → `--chart-4`), so it recolors with any brand theme.
 */
export function CorrelationHeatmap({
  labels,
  matrix,
  columns,
  title,
  annotate = true,
  width = 420,
  height = 420,
  className,
}: CorrelationHeatmapProps) {
  const m = matrix ?? (columns ? correlationMatrix(columns) : null)
  if (!m || labels.length === 0) return null

  const n = labels.length
  const margin = { top: title ? 34 : 12, right: 12, bottom: 84, left: 84 }
  const size = Math.min(width - margin.left - margin.right, height - margin.top - margin.bottom)
  const cell = size / n

  /** Diverging color: -1 → chart-4, 0 → card, +1 → chart-1. */
  const cellColor = (v: number): string => {
    const pct = Math.round(Math.min(Math.abs(v), 1) * 100)
    const end = v >= 0 ? "var(--chart-1)" : "var(--chart-4)"
    return `color-mix(in oklab, ${end} ${pct}%, var(--card))`
  }
  const textColor = (v: number): string =>
    Math.abs(v) > 0.55 ? "var(--background)" : "var(--foreground)"

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={title ?? "correlation heatmap"}
      className={cn("h-auto w-full", className)}
    >
      {title ? (
        <text x={margin.left} y={20} className="fill-foreground text-[13px] font-medium">
          {title}
        </text>
      ) : null}
      <g transform={`translate(${margin.left},${margin.top})`}>
        {m.map((row, i) =>
          row.map((v, j) => (
            <g key={`${i}-${j}`}>
              <rect
                x={j * cell}
                y={i * cell}
                width={cell - 1.5}
                height={cell - 1.5}
                rx={2}
                style={{ fill: cellColor(v) }}
              />
              {annotate ? (
                <text
                  x={j * cell + cell / 2}
                  y={i * cell + cell / 2}
                  dy="0.32em"
                  textAnchor="middle"
                  className="text-[10px] tabular-nums"
                  style={{ fill: textColor(v) }}
                >
                  {v.toFixed(2)}
                </text>
              ) : null}
            </g>
          )),
        )}

        {/* row labels */}
        {labels.map((label, i) => (
          <text
            key={`r-${label}`}
            x={-8}
            y={i * cell + cell / 2}
            dy="0.32em"
            textAnchor="end"
            className="fill-muted-foreground text-[11px]"
          >
            {label}
          </text>
        ))}
        {/* column labels (rotated) */}
        {labels.map((label, j) => (
          <text
            key={`c-${label}`}
            transform={`translate(${j * cell + cell / 2},${n * cell + 10}) rotate(-45)`}
            textAnchor="end"
            className="fill-muted-foreground text-[11px]"
          >
            {label}
          </text>
        ))}
      </g>
    </svg>
  )
}
