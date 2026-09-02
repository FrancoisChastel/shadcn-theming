"use client"

import * as React from "react"
import * as Plot from "@observablehq/plot"

import { cn } from "@/lib/utils"
import { usePlot } from "@/lib/use-plot"

const PLOT_STYLE = {
  background: "transparent",
  color: "var(--muted-foreground)",
  fontFamily: "inherit",
  fontSize: "11px",
}

const SERIES = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

export interface LineSeries {
  name: string
  points: Array<{ x: number; y: number }>
}

export interface LineChartProps {
  series: LineSeries[]
  title?: string
  xLabel?: string
  yLabel?: string
  height?: number
  /** Format x-axis ticks, e.g. `String` for integer years. */
  xTickFormat?: string
  /** Show markers at each point. */
  dots?: boolean
  className?: string
}

/**
 * A multi-series line / time-series chart (Observable Plot). Each series is
 * colored from the theme's chart palette, with a color legend.
 */
export function LineChart({
  series,
  title,
  xLabel,
  yLabel,
  height = 300,
  xTickFormat,
  dots = false,
  className,
}: LineChartProps) {
  const ref = usePlot(
    (width) => {
      if (!series?.length) return null
      const rows = series.flatMap((s) => s.points.map((p) => ({ name: s.name, x: p.x, y: p.y })))
      const marks: Plot.Markish[] = [
        Plot.ruleY([0], { stroke: "var(--muted-foreground)", strokeOpacity: 0.3 }),
        Plot.lineY(rows, { x: "x", y: "y", stroke: "name", strokeWidth: 2, tip: true }),
      ]
      if (dots) marks.push(Plot.dot(rows, { x: "x", y: "y", fill: "name", r: 2.5 }))
      return Plot.plot({
        width,
        height,
        marginTop: 16,
        style: PLOT_STYLE,
        x: { label: xLabel ?? null, ...(xTickFormat ? { tickFormat: xTickFormat } : {}) },
        y: { label: yLabel ?? null, grid: true },
        color: { domain: series.map((s) => s.name), range: SERIES, legend: true },
        marks,
      })
    },
    [series, xLabel, yLabel, height, xTickFormat, dots],
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
