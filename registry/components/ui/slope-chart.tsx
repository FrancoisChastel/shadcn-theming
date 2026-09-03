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

const PALETTE = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]

export interface SlopeItem {
  item: string
  left: number
  right: number
}

export interface SlopeChartProps {
  data: SlopeItem[]
  leftLabel?: string
  rightLabel?: string
  title?: string
  yLabel?: string
  height?: number
  className?: string
}

/**
 * A slopegraph: two aligned axes connected per item — the clearest way to show
 * how a ranking or level shifts between two periods.
 */
export function SlopeChart({ data, leftLabel = "Before", rightLabel = "After", title, yLabel, height = 340, className }: SlopeChartProps) {
  const ref = usePlot(
    (width) => {
      if (!data?.length) return null
      const long = data.flatMap((r) => [
        { item: r.item, t: leftLabel, v: r.left },
        { item: r.item, t: rightLabel, v: r.right },
      ])
      return Plot.plot({
        width,
        height,
        style: PLOT_STYLE,
        marginLeft: 40,
        marginRight: 96,
        x: { label: null, domain: [leftLabel, rightLabel], padding: 0.25 },
        y: { label: yLabel ?? null, grid: true },
        color: { domain: data.map((r) => r.item), range: PALETTE },
        marks: [
          Plot.line(long, { x: "t", y: "v", z: "item", stroke: "item", strokeWidth: 2, tip: true }),
          Plot.dot(long, { x: "t", y: "v", z: "item", fill: "item", r: 3.5 }),
          Plot.text(long.filter((d) => d.t === rightLabel), { x: "t", y: "v", text: (d: { item: string }) => d.item, textAnchor: "start", dx: 8, fontSize: 10, fill: "var(--foreground)" }),
        ],
      })
    },
    [data, leftLabel, rightLabel, yLabel, height],
  )

  return (
    <figure className={cn("m-0", className)}>
      {title ? <figcaption style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: "var(--foreground)" }}>{title}</figcaption> : null}
      <div ref={ref} />
    </figure>
  )
}
