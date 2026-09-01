import * as React from "react"

import { cn } from "@/lib/utils"
import { linearScale, niceTicks } from "@/lib/stats"

export interface PlotScales {
  xScale: (x: number) => number
  yScale: (y: number) => number
  innerWidth: number
  innerHeight: number
  xTicks: number[]
  yTicks: number[]
}

export interface PlotFrameProps {
  xDomain: [number, number]
  yDomain: [number, number]
  width?: number
  height?: number
  margin?: { top: number; right: number; bottom: number; left: number }
  title?: string
  xLabel?: string
  yLabel?: string
  xTickCount?: number
  yTickCount?: number
  /** Explicit x tick positions (e.g. band centers for categorical charts). */
  xTickValues?: number[]
  yTickValues?: number[]
  xTickFormat?: (v: number) => string
  yTickFormat?: (v: number) => string
  /** whitegrid (both), y-only, or none. Default "y". */
  grid?: "both" | "y" | "none"
  className?: string
  children: (scales: PlotScales) => React.ReactNode
}

const DEFAULT_MARGIN = { top: 28, right: 16, bottom: 40, left: 48 }

function format(v: number): string {
  if (Math.abs(v) >= 1000) return v.toLocaleString()
  return Number.isInteger(v) ? String(v) : v.toFixed(1)
}

/**
 * A seaborn-style plotting frame: despined axes, faint whitegrid, small muted
 * tick labels, and a title. It computes linear scales from the given domains
 * and hands them to `children` (render prop) to draw the marks. All color comes
 * from shadcn theme tokens, so any chart built on it inherits the brand theme.
 */
export function PlotFrame({
  xDomain,
  yDomain,
  width = 520,
  height = 320,
  margin = DEFAULT_MARGIN,
  title,
  xLabel,
  yLabel,
  xTickCount = 6,
  yTickCount = 5,
  xTickValues,
  yTickValues,
  xTickFormat = format,
  yTickFormat = format,
  grid = "y",
  className,
  children,
}: PlotFrameProps) {
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom
  const xScale = linearScale(xDomain, [0, innerWidth])
  const yScale = linearScale(yDomain, [innerHeight, 0])
  const xTicks = xTickValues ?? niceTicks(xDomain[0], xDomain[1], xTickCount)
  const yTicks = yTickValues ?? niceTicks(yDomain[0], yDomain[1], yTickCount)

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={title ?? "chart"}
      className={cn("h-auto w-full", className)}
    >
      {title ? (
        <text
          x={margin.left}
          y={margin.top - 12}
          className="fill-foreground text-[13px] font-medium"
        >
          {title}
        </text>
      ) : null}

      <g transform={`translate(${margin.left},${margin.top})`}>
        {/* gridlines */}
        {(grid === "y" || grid === "both") &&
          yTicks.map((t) => (
            <line
              key={`gy-${t}`}
              x1={0}
              x2={innerWidth}
              y1={yScale(t)}
              y2={yScale(t)}
              className="stroke-border"
              strokeWidth={1}
              strokeOpacity={0.6}
            />
          ))}
        {grid === "both" &&
          xTicks.map((t) => (
            <line
              key={`gx-${t}`}
              x1={xScale(t)}
              x2={xScale(t)}
              y1={0}
              y2={innerHeight}
              className="stroke-border"
              strokeWidth={1}
              strokeOpacity={0.6}
            />
          ))}

        {/* marks */}
        {children({ xScale, yScale, innerWidth, innerHeight, xTicks, yTicks })}

        {/* bottom axis */}
        <line
          x1={0}
          x2={innerWidth}
          y1={innerHeight}
          y2={innerHeight}
          className="stroke-border"
          strokeWidth={1}
        />
        {xTicks.map((t) => (
          <text
            key={`xt-${t}`}
            x={xScale(t)}
            y={innerHeight + 18}
            textAnchor="middle"
            className="fill-muted-foreground text-[11px] tabular-nums"
          >
            {xTickFormat(t)}
          </text>
        ))}
        {yTicks.map((t) => (
          <text
            key={`yt-${t}`}
            x={-8}
            y={yScale(t)}
            dy="0.32em"
            textAnchor="end"
            className="fill-muted-foreground text-[11px] tabular-nums"
          >
            {yTickFormat(t)}
          </text>
        ))}

        {xLabel ? (
          <text
            x={innerWidth / 2}
            y={innerHeight + 36}
            textAnchor="middle"
            className="fill-muted-foreground text-[11px]"
          >
            {xLabel}
          </text>
        ) : null}
        {yLabel ? (
          <text
            transform={`translate(${-38},${innerHeight / 2}) rotate(-90)`}
            textAnchor="middle"
            className="fill-muted-foreground text-[11px]"
          >
            {yLabel}
          </text>
        ) : null}
      </g>
    </svg>
  )
}
