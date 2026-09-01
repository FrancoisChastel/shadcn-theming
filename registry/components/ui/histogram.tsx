"use client"

import * as React from "react"
import * as Plot from "@observablehq/plot"

import { cn } from "@/lib/utils"
import { usePlot } from "@/lib/use-plot"
import { gaussianKDE, extent } from "@/lib/stats"

const PLOT_STYLE = {
  background: "transparent",
  color: "var(--muted-foreground)",
  fontFamily: "inherit",
  fontSize: "11px",
}

export interface HistogramProps {
  /** The sample to bin. */
  data: number[]
  /** Overlay a Gaussian KDE curve. Default true. */
  kde?: boolean
  title?: string
  xLabel?: string
  height?: number
  /** Any CSS color, including a theme token like var(--chart-1). */
  color?: string
  className?: string
}

/**
 * A distribution plot — histogram (density) with an optional KDE overlay,
 * rendered with Observable Plot. seaborn's `histplot(..., kde=True)`.
 */
export function Histogram({
  data,
  kde = true,
  title,
  xLabel,
  height = 300,
  color = "var(--chart-1)",
  className,
}: HistogramProps) {
  const ref = usePlot(
    (width) => {
      if (!data?.length) return null
      const bins = Math.max(1, Math.round(Math.sqrt(data.length)))
      const [mn, mx] = extent(data)
      const binWidth = (mx - mn) / bins || 1
      const marks: Plot.Markish[] = [
        Plot.rectY(
          data.map((v) => ({ v })),
          Plot.binX({ y: "count" }, { x: "v", thresholds: bins, fill: color, fillOpacity: 0.7, tip: true }),
        ),
      ]
      if (kde) {
        const f = gaussianKDE(data)
        const scale = data.length * binWidth // density → count axis
        const pts = Array.from({ length: 101 }, (_, i) => {
          const x = mn + ((mx - mn) * i) / 100
          return { x, y: f(x) * scale }
        })
        marks.push(Plot.lineY(pts, { x: "x", y: "y", stroke: color, strokeWidth: 2, curve: "basis" }))
      }
      return Plot.plot({
        width,
        height,
        style: PLOT_STYLE,
        x: { label: xLabel ?? null },
        y: { label: "Count", grid: true },
        marks,
      })
    },
    [data, kde, xLabel, height, color],
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
