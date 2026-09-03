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

export interface LorenzCurveProps {
  /** Raw positive values (e.g. incomes). The curve + Gini are derived. */
  data: number[]
  title?: string
  height?: number
  color?: string
  /** Show the computed Gini coefficient on the plot. Default true. */
  showGini?: boolean
  className?: string
}

/** Compute Lorenz points and the Gini coefficient from raw values. */
export function lorenz(data: number[]): { points: Array<{ p: number; l: number }>; gini: number } {
  const xs = [...data].sort((a, b) => a - b)
  const n = xs.length
  const total = xs.reduce((a, b) => a + b, 0) || 1
  let cum = 0
  const points: Array<{ p: number; l: number }> = [{ p: 0, l: 0 }]
  xs.forEach((v, i) => {
    cum += v
    points.push({ p: (i + 1) / n, l: cum / total })
  })
  let area = 0
  for (let i = 1; i < points.length; i++) area += (points[i].p - points[i - 1].p) * (points[i].l + points[i - 1].l) / 2
  return { points, gini: 1 - 2 * area }
}

/**
 * A Lorenz curve with the line of equality and the computed Gini coefficient —
 * the standard picture of income or wealth inequality.
 */
export function LorenzCurve({ data, title, height = 420, color = "var(--chart-1)", showGini = true, className }: LorenzCurveProps) {
  const ref = usePlot(
    (width) => {
      if (!data?.length) return null
      const { points, gini } = lorenz(data)
      const marks: Plot.Markish[] = [
        Plot.areaY(points, { x: "p", y: "l", fill: color, fillOpacity: 0.12 }),
        Plot.line([{ p: 0, l: 0 }, { p: 1, l: 1 }], { x: "p", y: "l", stroke: "var(--muted-foreground)", strokeDasharray: "4,4" }),
        Plot.line(points, { x: "p", y: "l", stroke: color, strokeWidth: 2 }),
      ]
      if (showGini) marks.push(Plot.text([{ p: 0.62, l: 0.26 }], { x: "p", y: "l", text: [`Gini ≈ ${gini.toFixed(2)}`], fill: "var(--foreground)", fontSize: 12, fontWeight: 600 }))
      return Plot.plot({
        width,
        height: Math.min(width, height),
        style: PLOT_STYLE,
        x: { label: "Cumulative share of population", grid: true, domain: [0, 1] },
        y: { label: "Cumulative share of income", grid: true, domain: [0, 1] },
        marks,
      })
    },
    [data, height, color, showGini],
  )

  return (
    <figure className={cn("m-0", className)}>
      {title ? <figcaption style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: "var(--foreground)" }}>{title}</figcaption> : null}
      <div ref={ref} />
    </figure>
  )
}
