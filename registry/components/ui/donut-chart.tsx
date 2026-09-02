"use client"

import * as React from "react"
import { pie, arc } from "d3-shape"

import { cn } from "@/lib/utils"

const SERIES = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

export interface DonutSlice {
  label: string
  value: number
}

export interface DonutChartProps {
  data: DonutSlice[]
  title?: string
  /** Big number in the middle; defaults to the total. */
  centerLabel?: string
  centerSub?: string
  size?: number
  className?: string
}

const color = (i: number) => SERIES[i % SERIES.length]!

/**
 * A donut chart (d3-shape) with a legend and center label. Slices use the
 * theme's chart palette.
 */
export function DonutChart({ data, title, centerLabel, centerSub, size = 240, className }: DonutChartProps) {
  const total = data.reduce((a, b) => a + b.value, 0)
  const r = size / 2
  const arcs = React.useMemo(() => {
    const gen = pie<DonutSlice>().value((d) => d.value).sort(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const a = arc().innerRadius(r * 0.62).outerRadius(r - 4).padAngle(0.012).cornerRadius(2) as any
    return gen(data).map((s) => (a(s) as string) ?? "")
  }, [data, r])

  return (
    <figure className={cn("m-0", className)}>
      {title ? (
        <figcaption style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: "var(--foreground)" }}>{title}</figcaption>
      ) : null}
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <svg
          viewBox={`0 0 ${size} ${size}`}
          width={size}
          height={size}
          role="img"
          aria-label={title ?? "donut chart"}
        >
          <g transform={`translate(${r},${r})`}>
            {arcs.map((d, i) => (
              <path key={i} d={d} fill={color(i)} />
            ))}
            <text textAnchor="middle" dy="-0.05em" fontSize={20} fontWeight={650} fill="var(--foreground)">
              {centerLabel ?? String(total)}
            </text>
            {centerSub ? (
              <text textAnchor="middle" dy="1.3em" fontSize={11} fill="var(--muted-foreground)">
                {centerSub}
              </text>
            ) : null}
          </g>
        </svg>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, fontSize: 12, color: "var(--muted-foreground)" }}>
          {data.map((d, i) => (
            <li key={d.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 0" }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: color(i), display: "inline-block" }} />
              {d.label} {Math.round((d.value / total) * 100)}%
            </li>
          ))}
        </ul>
      </div>
    </figure>
  )
}
