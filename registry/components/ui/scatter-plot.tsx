import * as React from "react"

import { cn } from "@/lib/utils"
import { linearRegression, extent } from "@/lib/stats"
import { PlotFrame } from "@/components/ui/plot-frame"

export interface Point {
  x: number
  y: number
}

export interface ScatterPlotProps {
  data: Point[]
  /** Draw an OLS regression line. Default true. */
  regression?: boolean
  /** Shade a 95% confidence band around the regression line. Default true. */
  band?: boolean
  /** Show the R² annotation. Default true. */
  showR2?: boolean
  title?: string
  xLabel?: string
  yLabel?: string
  width?: number
  height?: number
  className?: string
}

/**
 * A scatter plot with an optional OLS regression line and 95% confidence band —
 * seaborn's `regplot`. Points, line, and band all use the `chart-1` theme token.
 */
export function ScatterPlot({
  data,
  regression = true,
  band = true,
  showR2 = true,
  title,
  xLabel,
  yLabel,
  width,
  height,
  className,
}: ScatterPlotProps) {
  if (!data || data.length === 0) return null

  const xs = data.map((d) => d.x)
  const ys = data.map((d) => d.y)
  const [xMin, xMax] = extent(xs)
  const [yMin, yMax] = extent(ys)
  const xPad = (xMax - xMin) * 0.05 || 1
  const yPad = (yMax - yMin) * 0.08 || 1
  const xDomain: [number, number] = [xMin - xPad, xMax + xPad]
  const yDomain: [number, number] = [yMin - yPad, yMax + yPad]

  const reg = regression ? linearRegression(xs, ys) : null
  const samples = 48
  const linePts: Array<[number, number]> = []
  const upper: Array<[number, number]> = []
  const lower: Array<[number, number]> = []
  if (reg) {
    for (let i = 0; i <= samples; i++) {
      const x = xDomain[0] + ((xDomain[1] - xDomain[0]) * i) / samples
      const yhat = reg.predict(x)
      linePts.push([x, yhat])
      const ci = 1.96 * reg.seMean(x)
      upper.push([x, yhat + ci])
      lower.push([x, yhat - ci])
    }
  }

  return (
    <PlotFrame
      xDomain={xDomain}
      yDomain={yDomain}
      title={title}
      xLabel={xLabel}
      yLabel={yLabel}
      width={width}
      height={height}
      className={className}
      grid="both"
    >
      {({ xScale, yScale }) => (
        <>
          {reg && band ? (
            <path
              d={
                upper.map(([x, y], i) => `${i ? "L" : "M"}${xScale(x).toFixed(2)},${yScale(y).toFixed(2)}`).join(" ") +
                " " +
                [...lower].reverse().map(([x, y]) => `L${xScale(x).toFixed(2)},${yScale(y).toFixed(2)}`).join(" ") +
                " Z"
              }
              className="fill-chart-1 stroke-none"
              fillOpacity={0.12}
            />
          ) : null}

          {data.map((d, i) => (
            <circle
              key={i}
              cx={xScale(d.x)}
              cy={yScale(d.y)}
              r={3}
              className="fill-chart-1"
              fillOpacity={0.65}
            />
          ))}

          {reg ? (
            <path
              d={linePts
                .map(([x, y], i) => `${i ? "L" : "M"}${xScale(x).toFixed(2)},${yScale(y).toFixed(2)}`)
                .join(" ")}
              className={cn("fill-none stroke-chart-1")}
              strokeWidth={2}
            />
          ) : null}

          {reg && showR2 ? (
            <text x={6} y={12} className="fill-muted-foreground text-[11px] tabular-nums">
              R² = {reg.r2.toFixed(3)}
            </text>
          ) : null}
        </>
      )}
    </PlotFrame>
  )
}
