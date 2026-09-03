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

export interface WaterfallItem {
  label: string
  /** Signed contribution; positive rises, negative falls. */
  value: number
}

export interface WaterfallChartProps {
  data: WaterfallItem[]
  title?: string
  yLabel?: string
  /** Label for the summed total bar. Default "Total". */
  totalLabel?: string
  height?: number
  upColor?: string
  downColor?: string
  totalColor?: string
  className?: string
}

/**
 * A waterfall chart: signed contributions stacked cumulatively to a total —
 * ideal for growth decompositions, budget bridges, and variance analysis.
 */
export function WaterfallChart({
  data,
  title,
  yLabel,
  totalLabel = "Total",
  height = 320,
  upColor = "var(--chart-5)",
  downColor = "var(--chart-4)",
  totalColor = "var(--foreground)",
  className,
}: WaterfallChartProps) {
  const ref = usePlot(
    (width) => {
      if (!data?.length) return null
      let cum = 0
      const rows = data.map((it) => {
        const start = cum
        cum += it.value
        return { label: it.label, lo: Math.min(start, cum), hi: Math.max(start, cum), dir: it.value >= 0 ? "up" : "down", value: it.value }
      })
      rows.push({ label: totalLabel, lo: Math.min(0, cum), hi: Math.max(0, cum), dir: "total", value: Number(cum.toFixed(2)) })
      const fill = (d: { dir: string }) => (d.dir === "total" ? totalColor : d.dir === "up" ? upColor : downColor)
      return Plot.plot({
        width,
        height,
        style: PLOT_STYLE,
        marginBottom: 66,
        x: { label: null, domain: rows.map((r) => r.label), tickRotate: -30 },
        y: { label: yLabel ?? null, grid: true },
        color: { type: "identity" },
        marks: [
          Plot.ruleY([0], { stroke: "var(--foreground)", strokeOpacity: 0.4 }),
          Plot.rectY(rows, { x: "label", y1: "lo", y2: "hi", fill, inset: 6, rx: 1, tip: true }),
        ],
      })
    },
    [data, yLabel, totalLabel, height, upColor, downColor, totalColor],
  )

  return (
    <figure className={cn("m-0", className)}>
      {title ? <figcaption style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: "var(--foreground)" }}>{title}</figcaption> : null}
      <div ref={ref} />
    </figure>
  )
}
