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

export interface Candle {
  /** Ordinal or timestamp on the x axis. */
  t: number
  o: number
  h: number
  l: number
  c: number
}

export interface CandlestickChartProps {
  data: Candle[]
  title?: string
  xLabel?: string
  yLabel?: string
  height?: number
  upColor?: string
  downColor?: string
  className?: string
}

/**
 * A candlestick (OHLC) chart: a wick from low to high with an open→close body,
 * colored by direction — the standard view for prices, rates, and yields.
 */
export function CandlestickChart({
  data,
  title,
  xLabel,
  yLabel,
  height = 300,
  upColor = "var(--chart-5)",
  downColor = "var(--chart-4)",
  className,
}: CandlestickChartProps) {
  const ref = usePlot(
    (width) => {
      if (!data?.length) return null
      const color = (k: Candle) => (k.c >= k.o ? upColor : downColor)
      return Plot.plot({
        width,
        height,
        style: PLOT_STYLE,
        x: { label: xLabel ?? null, tickFormat: "d" },
        y: { label: yLabel ?? null, grid: true },
        color: { type: "identity" },
        marks: [
          Plot.ruleX(data, { x: "t", y1: "l", y2: "h", stroke: color }),
          Plot.rect(data, { x1: (k: Candle) => k.t - 0.32, x2: (k: Candle) => k.t + 0.32, y1: "o", y2: "c", fill: color, tip: true }),
        ],
      })
    },
    [data, xLabel, yLabel, height, upColor, downColor],
  )

  return (
    <figure className={cn("m-0", className)}>
      {title ? <figcaption style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: "var(--foreground)" }}>{title}</figcaption> : null}
      <div ref={ref} />
    </figure>
  )
}
