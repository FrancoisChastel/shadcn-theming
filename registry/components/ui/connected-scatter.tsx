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

export interface PathPoint {
  x: number
  y: number
  /** Optional label drawn at the point (e.g. a year). */
  label?: string | number
}

export interface ConnectedScatterProps {
  data: PathPoint[]
  title?: string
  xLabel?: string
  yLabel?: string
  height?: number
  color?: string
  className?: string
}

/**
 * A connected scatter: points joined in sequence with an arrowed path — traces a
 * trajectory through a 2-D space over time (e.g. an unemployment↔inflation path).
 */
export function ConnectedScatter({ data, title, xLabel, yLabel, height = 320, color = "var(--chart-1)", className }: ConnectedScatterProps) {
  const ref = usePlot(
    (width) => {
      if (!data?.length) return null
      return Plot.plot({
        width,
        height,
        style: PLOT_STYLE,
        x: { label: xLabel ?? null, grid: true },
        y: { label: yLabel ?? null, grid: true },
        marks: [
          Plot.line(data, { x: "x", y: "y", stroke: color, strokeWidth: 1.6, curve: "catmull-rom", marker: "arrow" }),
          Plot.dot(data, { x: "x", y: "y", fill: color, r: 3.5, tip: true }),
          Plot.text(data, { x: "x", y: "y", text: (p: PathPoint) => (p.label != null ? String(p.label) : ""), dy: -9, fontSize: 9, fill: "var(--muted-foreground)" }),
        ],
      })
    },
    [data, xLabel, yLabel, height, color],
  )

  return (
    <figure className={cn("m-0", className)}>
      {title ? <figcaption style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: "var(--foreground)" }}>{title}</figcaption> : null}
      <div ref={ref} />
    </figure>
  )
}
