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

export interface BandPoint {
  x: number
  y: number
  /** Lower/upper bounds of a confidence or projection interval. */
  lower?: number
  upper?: number
  /** Mark this point (and the segment to it) as a forecast. */
  forecast?: boolean
}

export interface AreaBandProps {
  data: BandPoint[]
  title?: string
  yLabel?: string
  /** Draw a subtle zero reference line. Default true. */
  zeroLine?: boolean
  height?: number
  color?: string
  className?: string
}

/**
 * A line with a shaded confidence/projection band and a dashed forecast tail —
 * the IMF WEO "fan chart" idiom, rendered with Observable Plot.
 */
export function AreaBand({
  data,
  title,
  yLabel,
  zeroLine = true,
  height = 300,
  color = "var(--chart-1)",
  className,
}: AreaBandProps) {
  const ref = usePlot(
    (width) => {
      if (!data?.length) return null
      const banded = data.filter((d) => d.lower != null && d.upper != null)
      const history = data.filter((d) => !d.forecast)
      const ff = data.findIndex((d) => d.forecast)
      const forecast = ff === -1 ? [] : data.slice(Math.max(0, ff - 1))
      const marks: Plot.Markish[] = []
      if (zeroLine) marks.push(Plot.ruleY([0], { stroke: "var(--muted-foreground)", strokeOpacity: 0.4, strokeDasharray: "3,3" }))
      if (banded.length > 1) marks.push(Plot.areaY(banded, { x: "x", y1: "lower", y2: "upper", fill: color, fillOpacity: 0.15 }))
      marks.push(Plot.line(history, { x: "x", y: "y", stroke: color, strokeWidth: 2 }))
      if (forecast.length > 1) marks.push(Plot.line(forecast, { x: "x", y: "y", stroke: color, strokeWidth: 2, strokeDasharray: "5,4" }))
      marks.push(
        Plot.dot(data, {
          x: "x",
          y: "y",
          fill: color,
          r: 2.5,
          fillOpacity: (d: BandPoint) => (d.forecast ? 0.5 : 1),
          tip: true,
        }),
      )
      return Plot.plot({
        width,
        height,
        style: PLOT_STYLE,
        x: { label: null, tickFormat: "d" },
        y: { label: yLabel ?? null, grid: true },
        marks,
      })
    },
    [data, yLabel, zeroLine, height, color],
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
