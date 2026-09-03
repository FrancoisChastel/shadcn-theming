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

export interface EcdfPlotProps {
  data: number[]
  title?: string
  xLabel?: string
  height?: number
  color?: string
  /** Draw a dashed reference line at the median probability. Default true. */
  medianLine?: boolean
  className?: string
}

/**
 * An empirical cumulative distribution function (ECDF) — a step curve of the
 * share of observations at or below each value. seaborn `ecdfplot`.
 */
export function EcdfPlot({ data, title, xLabel, height = 300, color = "var(--chart-1)", medianLine = true, className }: EcdfPlotProps) {
  const ref = usePlot(
    (width) => {
      if (!data?.length) return null
      const xs = [...data].sort((a, b) => a - b)
      const n = xs.length
      const rows = xs.map((x, i) => ({ x, p: (i + 1) / n }))
      const marks: Plot.Markish[] = []
      if (medianLine) marks.push(Plot.ruleY([0.5], { stroke: "var(--muted-foreground)", strokeOpacity: 0.4, strokeDasharray: "3,3" }))
      marks.push(Plot.lineY(rows, { x: "x", y: "p", stroke: color, strokeWidth: 2, curve: "step-after" }))
      return Plot.plot({
        width,
        height,
        style: PLOT_STYLE,
        x: { label: xLabel ?? null, grid: true },
        y: { label: "Cumulative probability", grid: true, domain: [0, 1] },
        marks,
      })
    },
    [data, xLabel, height, color, medianLine],
  )

  return (
    <figure className={cn("m-0", className)}>
      {title ? <figcaption style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: "var(--foreground)" }}>{title}</figcaption> : null}
      <div ref={ref} />
    </figure>
  )
}
