import * as React from "react"

import { cn } from "@/lib/utils"
import { extent } from "@/lib/stats"
import { PlotFrame } from "@/components/ui/plot-frame"

export interface BandPoint {
  x: number
  y: number
  /** Lower/upper bounds of a confidence or projection interval. */
  lower?: number
  upper?: number
  /** Mark this point (and the segment leading to it) as a forecast. */
  forecast?: boolean
}

export interface AreaBandProps {
  data: BandPoint[]
  title?: string
  xLabel?: string
  yLabel?: string
  /** Draw a subtle zero reference line. Default true. */
  zeroLine?: boolean
  width?: number
  height?: number
  className?: string
  xTickFormat?: (v: number) => string
}

/**
 * A line with a shaded confidence/projection band — the IMF WEO "fan chart"
 * idiom. History renders as a solid line, forecast points as a dashed line, and
 * the band is drawn wherever `lower`/`upper` are provided. Uses the `chart-1`
 * theme token throughout.
 */
export function AreaBand({
  data,
  title,
  xLabel,
  yLabel,
  zeroLine = true,
  width,
  height,
  className,
  xTickFormat,
}: AreaBandProps) {
  if (!data || data.length === 0) return null

  const xs = data.map((d) => d.x)
  const ysAll = data.flatMap((d) => [d.y, d.lower ?? d.y, d.upper ?? d.y])
  const [xMin, xMax] = extent(xs)
  const [yMin, yMax] = extent(ysAll)
  const yPad = (yMax - yMin) * 0.1 || 1
  const yDomain: [number, number] = [Math.min(yMin - yPad, 0), yMax + yPad]

  const banded = data.filter((d) => d.lower !== undefined && d.upper !== undefined)

  return (
    <PlotFrame
      xDomain={[xMin, xMax]}
      yDomain={yDomain}
      title={title}
      xLabel={xLabel}
      yLabel={yLabel}
      width={width}
      height={height}
      className={className}
      grid="y"
      {...(xTickFormat ? { xTickFormat } : {})}
    >
      {({ xScale, yScale, innerWidth }) => {
        const line = (pts: BandPoint[]) =>
          pts
            .map((d, i) => `${i ? "L" : "M"}${xScale(d.x).toFixed(2)},${yScale(d.y).toFixed(2)}`)
            .join(" ")

        // Split into solid history and dashed forecast (kept contiguous).
        const firstForecast = data.findIndex((d) => d.forecast)
        const history = firstForecast === -1 ? data : data.slice(0, firstForecast + 1)
        const forecast = firstForecast === -1 ? [] : data.slice(firstForecast - 1 >= 0 ? firstForecast - 1 : 0)

        const bandPath =
          banded.length > 1
            ? banded.map((d, i) => `${i ? "L" : "M"}${xScale(d.x).toFixed(2)},${yScale(d.upper!).toFixed(2)}`).join(" ") +
              " " +
              [...banded].reverse().map((d) => `L${xScale(d.x).toFixed(2)},${yScale(d.lower!).toFixed(2)}`).join(" ") +
              " Z"
            : null

        return (
          <>
            {zeroLine && yDomain[0] < 0 && yDomain[1] > 0 ? (
              <line
                x1={0}
                x2={innerWidth}
                y1={yScale(0)}
                y2={yScale(0)}
                className="stroke-muted-foreground"
                strokeWidth={1}
                strokeOpacity={0.4}
                strokeDasharray="3 3"
              />
            ) : null}

            {bandPath ? (
              <path d={bandPath} className="fill-chart-1 stroke-none" fillOpacity={0.15} />
            ) : null}

            <path d={line(history)} className={cn("fill-none stroke-chart-1")} strokeWidth={2} strokeLinejoin="round" />
            {forecast.length > 1 ? (
              <path
                d={line(forecast)}
                className="fill-none stroke-chart-1"
                strokeWidth={2}
                strokeDasharray="5 4"
                strokeLinejoin="round"
              />
            ) : null}

            {data.map((d, i) => (
              <circle
                key={i}
                cx={xScale(d.x)}
                cy={yScale(d.y)}
                r={2.5}
                className="fill-chart-1"
                fillOpacity={d.forecast ? 0.5 : 1}
              />
            ))}
          </>
        )
      }}
    </PlotFrame>
  )
}
