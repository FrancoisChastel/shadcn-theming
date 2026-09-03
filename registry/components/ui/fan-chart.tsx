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

export interface FanPoint {
  x: number
  median: number
  forecast: boolean
  /** [low, high] bounds for the 50% / 80% / 90% intervals. */
  b50: [number, number]
  b80: [number, number]
  b90: [number, number]
}

export interface FanChartProps {
  data: FanPoint[]
  title?: string
  yLabel?: string
  height?: number
  color?: string
  className?: string
}

/**
 * A probabilistic fan chart: a median path with nested 50/80/90% projection
 * bands that widen into the forecast horizon — the IMF WEO forecast idiom.
 */
export function FanChart({ data, title, yLabel, height = 320, color = "var(--chart-1)", className }: FanChartProps) {
  const ref = usePlot(
    (width) => {
      if (!data?.length) return null
      const hist = data.filter((d) => !d.forecast)
      const fc = data.filter((d) => d.forecast)
      const bridge = hist.length ? [hist[hist.length - 1], ...fc] : fc
      const band = (key: "b50" | "b80" | "b90") => bridge.map((p) => ({ x: p.x, lo: p[key][0], hi: p[key][1] }))
      return Plot.plot({
        width,
        height,
        style: PLOT_STYLE,
        x: { label: null, tickFormat: "d" },
        y: { label: yLabel ?? null, grid: true },
        marks: [
          Plot.ruleY([0], { stroke: "var(--muted-foreground)", strokeOpacity: 0.4, strokeDasharray: "3,3" }),
          Plot.areaY(band("b90"), { x: "x", y1: "lo", y2: "hi", fill: color, fillOpacity: 0.1 }),
          Plot.areaY(band("b80"), { x: "x", y1: "lo", y2: "hi", fill: color, fillOpacity: 0.14 }),
          Plot.areaY(band("b50"), { x: "x", y1: "lo", y2: "hi", fill: color, fillOpacity: 0.22 }),
          Plot.line(hist, { x: "x", y: "median", stroke: color, strokeWidth: 2 }),
          Plot.line(bridge, { x: "x", y: "median", stroke: color, strokeWidth: 2, strokeDasharray: "5,4" }),
          Plot.dot(data, { x: "x", y: "median", r: 2, fill: color, tip: true }),
        ],
      })
    },
    [data, yLabel, height, color],
  )

  return (
    <figure className={cn("m-0", className)}>
      {title ? <figcaption style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: "var(--foreground)" }}>{title}</figcaption> : null}
      <div ref={ref} />
    </figure>
  )
}
