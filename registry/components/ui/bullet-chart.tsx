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

export interface BulletDatum {
  label: string
  value: number
  target: number
  max: number
  unit?: string
}

export interface BulletChartProps {
  data: BulletDatum[]
  title?: string
  color?: string
  className?: string
}

/**
 * A bullet chart (Observable Plot) — a track, an actual-value bar, and a target
 * tick per row. Good for KPI vs target displays.
 */
export function BulletChart({ data, title, color = "var(--chart-1)", className }: BulletChartProps) {
  const ref = usePlot(
    (width) => {
      if (!data?.length) return null
      return Plot.plot({
        width,
        height: 46 * data.length + 26,
        marginLeft: 96,
        marginTop: 12,
        style: PLOT_STYLE,
        x: { label: null, grid: true },
        y: { label: null, domain: data.map((d) => d.label) },
        marks: [
          Plot.barX(data, { x: "max", y: "label", fill: "var(--muted)" }),
          Plot.barX(data, {
            x: "value",
            y: "label",
            fill: color,
            inset: 8,
            tip: true,
            title: (d: BulletDatum) => `${d.label}: ${d.value}${d.unit ?? ""} (target ${d.target})`,
          }),
          Plot.tickX(data, { x: "target", y: "label", stroke: "var(--foreground)", strokeWidth: 2 }),
        ],
      })
    },
    [data, color],
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
