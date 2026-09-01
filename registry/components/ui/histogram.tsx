import * as React from "react"

import { cn } from "@/lib/utils"
import { histogramBins, gaussianKDE, extent } from "@/lib/stats"
import { PlotFrame } from "@/components/ui/plot-frame"

export interface HistogramProps {
  /** The sample to bin. */
  data: number[]
  /** Number of bins; defaults to the √n rule. */
  bins?: number
  /** Overlay a Gaussian kernel-density estimate. Default true. */
  kde?: boolean
  title?: string
  xLabel?: string
  yLabel?: string
  width?: number
  height?: number
  className?: string
}

/**
 * A distribution plot — histogram with an optional KDE overlay, seaborn's
 * `histplot(..., kde=True)`. Bars use density when the KDE is shown so the two
 * align. Colored through the `chart-1` theme token.
 */
export function Histogram({
  data,
  bins,
  kde = true,
  title,
  xLabel,
  yLabel,
  width,
  height,
  className,
}: HistogramProps) {
  if (!data || data.length === 0) return null

  const binData = histogramBins(data, bins)
  const [xMin, xMax] = extent(data)
  const useDensity = kde
  let yMax = Math.max(...binData.map((b) => (useDensity ? b.density : b.count)))

  const kdeFn = kde ? gaussianKDE(data) : null
  const kdePoints: Array<[number, number]> = []
  if (kdeFn) {
    const samples = 96
    for (let i = 0; i <= samples; i++) {
      const x = xMin + ((xMax - xMin) * i) / samples
      const y = kdeFn(x)
      kdePoints.push([x, y])
      if (y > yMax) yMax = y
    }
  }
  yMax *= 1.1

  return (
    <PlotFrame
      xDomain={[xMin, xMax]}
      yDomain={[0, yMax]}
      title={title}
      xLabel={xLabel}
      yLabel={yLabel ?? (useDensity ? "Density" : "Count")}
      width={width}
      height={height}
      className={className}
      grid="y"
    >
      {({ xScale, yScale, innerHeight }) => (
        <>
          {binData.map((b, i) => {
            const x = xScale(b.x0)
            const w = Math.max(0, xScale(b.x1) - xScale(b.x0) - 1)
            const value = useDensity ? b.density : b.count
            const y = yScale(value)
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={w}
                height={Math.max(0, innerHeight - y)}
                className="fill-chart-1"
                fillOpacity={0.7}
                rx={1}
              />
            )
          })}
          {kdeFn ? (
            <path
              d={kdePoints
                .map(([x, y], i) => `${i ? "L" : "M"}${xScale(x).toFixed(2)},${yScale(y).toFixed(2)}`)
                .join(" ")}
              className={cn("fill-none stroke-chart-1")}
              strokeWidth={2}
              strokeLinejoin="round"
            />
          ) : null}
        </>
      )}
    </PlotFrame>
  )
}
