"use client"

import * as React from "react"
import * as Plot from "@observablehq/plot"

import { cn } from "@/lib/utils"
import { usePlot } from "@/lib/use-plot"
import { correlationMatrix } from "@/lib/stats"

const PLOT_STYLE = {
  background: "transparent",
  color: "var(--muted-foreground)",
  fontFamily: "inherit",
  fontSize: "11px",
}

export interface CorrelationHeatmapProps {
  labels: string[]
  /** A precomputed correlation matrix… */
  matrix?: number[][]
  /** …or raw equal-length columns to compute Pearson correlations from. */
  columns?: number[][]
  title?: string
  /** Print the coefficient in each cell. Default true. */
  annotate?: boolean
  height?: number
  className?: string
}

/** Diverging cell color from theme tokens: +1 → chart-1, -1 → chart-4. */
function cellColor(r: number): string {
  const end = r >= 0 ? "var(--chart-1)" : "var(--chart-4)"
  return `color-mix(in oklab, ${end} ${Math.round(Math.min(Math.abs(r), 1) * 100)}%, var(--card))`
}

/**
 * A correlation matrix heatmap (Observable Plot `cell`) with a theme-derived
 * diverging color scale. seaborn's `heatmap(df.corr())`.
 */
export function CorrelationHeatmap({
  labels,
  matrix,
  columns,
  title,
  annotate = true,
  height,
  className,
}: CorrelationHeatmapProps) {
  const ref = usePlot(
    (width) => {
      const m = matrix ?? (columns ? correlationMatrix(columns) : null)
      if (!m || !labels.length) return null
      const cells = m.flatMap((row, i) => row.map((r, j) => ({ a: labels[i]!, b: labels[j]!, r })))
      const size = Math.min(width, height ?? 460)
      const marks: Plot.Markish[] = [
        Plot.cell(cells, { x: "b", y: "a", fill: (d: { r: number }) => cellColor(d.r), inset: 0.5, rx: 2, tip: true, channels: { r: "r" } }),
      ]
      if (annotate) {
        marks.push(
          Plot.text(cells, {
            x: "b",
            y: "a",
            text: (d: { r: number }) => d.r.toFixed(2),
            fill: (d: { r: number }) => (Math.abs(d.r) > 0.55 ? "var(--background)" : "var(--foreground)"),
            fontSize: 10,
          }),
        )
      }
      return Plot.plot({
        width: size,
        height: size,
        marginLeft: 96,
        marginBottom: 96,
        style: PLOT_STYLE,
        x: { label: null, domain: labels, tickRotate: -45 },
        y: { label: null, domain: labels },
        color: { type: "identity" },
        marks,
      })
    },
    [labels, matrix, columns, annotate, height],
  )

  return (
    <figure className={cn("m-0", className)}>
      {title ? (
        <figcaption style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: "var(--foreground)" }}>{title}</figcaption>
      ) : null}
      <div ref={ref} />
    </figure>
  )
}
