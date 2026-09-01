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

export interface Point {
  x: number
  y: number
}

export interface ScatterPlotProps {
  data: Point[]
  /** Draw an OLS regression line + confidence band. Default true. */
  regression?: boolean
  title?: string
  xLabel?: string
  yLabel?: string
  height?: number
  color?: string
  className?: string
}

/**
 * A scatter plot with an OLS regression line and 95% confidence band, rendered
 * with Observable Plot's `linearRegressionY`. seaborn's `regplot`.
 */
export function ScatterPlot({
  data,
  regression = true,
  title,
  xLabel,
  yLabel,
  height = 300,
  color = "var(--chart-1)",
  className,
}: ScatterPlotProps) {
  const ref = usePlot(
    (width) => {
      if (!data?.length) return null
      const marks: Plot.Markish[] = []
      if (regression) {
        marks.push(Plot.linearRegressionY(data, { x: "x", y: "y", stroke: color, fill: color, fillOpacity: 0.12 }))
      }
      marks.push(Plot.dot(data, { x: "x", y: "y", fill: color, fillOpacity: 0.65, r: 3, tip: true }))
      return Plot.plot({
        width,
        height,
        style: PLOT_STYLE,
        x: { label: xLabel ?? null, grid: true },
        y: { label: yLabel ?? null, grid: true },
        marks,
      })
    },
    [data, regression, xLabel, yLabel, height, color],
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
