import * as React from "react"

import { cn } from "@/lib/utils"

export interface SparklineProps extends React.SVGProps<SVGSVGElement> {
  /** The series to plot. Needs at least two points. */
  data: number[]
  width?: number
  height?: number
  strokeWidth?: number
  /** Fill the area under the line with a faded version of the stroke color. */
  fill?: boolean
  /** Draw a dot on the last point. */
  showLastDot?: boolean
}

/**
 * A tiny, dependency-free trend line. Color is driven by the current text
 * color (`text-primary` by default), so it inherits any shadcn brand theme —
 * set `className="text-chart-2"` / `text-destructive` to recolor.
 */
export function Sparkline({
  data,
  width = 100,
  height = 28,
  strokeWidth = 1.5,
  fill = false,
  showLastDot = true,
  className,
  ...props
}: SparklineProps) {
  if (!data || data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const stepX = width / (data.length - 1)
  const pad = strokeWidth / 2

  const points = data.map((value, index) => {
    const x = index * stepX
    const y = height - pad - ((value - min) / range) * (height - strokeWidth)
    return [x, y] as const
  })

  const line = points.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ")
  const area = `${line} ${width.toFixed(2)},${height} 0,${height}`
  const last = points[points.length - 1]

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      role="img"
      aria-label="trend"
      className={cn("overflow-visible text-primary", className)}
      {...props}
    >
      {fill ? (
        <polygon points={area} className="fill-current opacity-10" stroke="none" />
      ) : null}
      <polyline
        points={line}
        className="stroke-current"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {showLastDot && last ? (
        <circle cx={last[0]} cy={last[1]} r={strokeWidth * 1.4} className="fill-current" />
      ) : null}
    </svg>
  )
}
