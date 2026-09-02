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

export interface BarDatum {
  /** Category on the x-axis. */
  group: string
  /** Series (the color/legend dimension). */
  series: string
  value: number
}

export interface BarChartProps {
  data: BarDatum[]
  /** Stack series instead of grouping them side by side. Default false. */
  stacked?: boolean
  title?: string
  yLabel?: string
  height?: number
  className?: string
}

/**
 * A grouped or stacked bar chart (Observable Plot). Series are colored from the
 * theme's chart palette with a legend.
 */
export function BarChart({ data, stacked = false, title, yLabel, height = 300, className }: BarChartProps) {
  const ref = usePlot(
    (width) => {
      if (!data?.length) return null
      const seriesNames = [...new Set(data.map((d) => d.series))]
      const bar = stacked
        ? Plot.barY(data, { x: "group", y: "value", fill: "series", tip: true })
        : Plot.barY(data, { x: "series", y: "value", fx: "group", fill: "series", tip: true })
      return Plot.plot({
        width,
        height,
        marginTop: 16,
        style: PLOT_STYLE,
        x: stacked ? { label: null } : { axis: null },
        ...(stacked ? {} : { fx: { label: null } }),
        y: { label: yLabel ?? null, grid: true },
        color: { domain: seriesNames, range: SERIES, legend: true },
        marks: [bar, Plot.ruleY([0])],
      })
    },
    [data, stacked, yLabel, height],
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
