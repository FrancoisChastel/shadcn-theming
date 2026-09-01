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

export interface BoxPlotGroup {
  label: string
  values: number[]
}

export interface BoxPlotProps {
  groups: BoxPlotGroup[]
  title?: string
  yLabel?: string
  height?: number
  className?: string
}

/**
 * Grouped Tukey box plots (Observable Plot `boxY`) — box, median, 1.5·IQR
 * whiskers, and outliers, each group cycling the theme's chart palette.
 * seaborn's `boxplot`.
 */
export function BoxPlot({ groups, title, yLabel, height = 300, className }: BoxPlotProps) {
  const ref = usePlot(
    (width) => {
      if (!groups?.length) return null
      const rows = groups.flatMap((g) => g.values.map((v) => ({ group: g.label, v })))
      return Plot.plot({
        width,
        height,
        style: PLOT_STYLE,
        x: { label: null, tickSize: 0 },
        y: { label: yLabel ?? null, grid: true },
        color: { domain: groups.map((g) => g.label), range: SERIES },
        marks: [
          Plot.boxY(rows, {
            x: "group",
            y: "v",
            fill: "group",
            fillOpacity: 0.6,
            stroke: "var(--foreground)",
            strokeOpacity: 0.7,
          }),
        ],
      })
    },
    [groups, yLabel, height],
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
