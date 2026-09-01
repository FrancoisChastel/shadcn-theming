import * as React from "react"

import { cn } from "@/lib/utils"
import { boxStats, extent } from "@/lib/stats"
import { PlotFrame } from "@/components/ui/plot-frame"

export interface BoxPlotGroup {
  label: string
  values: number[]
}

export interface BoxPlotProps {
  groups: BoxPlotGroup[]
  title?: string
  yLabel?: string
  width?: number
  height?: number
  className?: string
}

const FILL = ["fill-chart-1", "fill-chart-2", "fill-chart-3", "fill-chart-4", "fill-chart-5"]
const STROKE = [
  "stroke-chart-1",
  "stroke-chart-2",
  "stroke-chart-3",
  "stroke-chart-4",
  "stroke-chart-5",
]

/**
 * Grouped Tukey box plots — box (IQR), median, 1.5·IQR whiskers, and outliers,
 * seaborn's `boxplot`. Each group cycles through the theme's chart palette.
 */
export function BoxPlot({ groups, title, yLabel, width, height, className }: BoxPlotProps) {
  if (!groups || groups.length === 0) return null

  const all = groups.flatMap((g) => g.values)
  const [dMin, dMax] = extent(all)
  const pad = (dMax - dMin) * 0.08 || 1
  const n = groups.length
  const centers = groups.map((_, i) => i + 0.5)

  return (
    <PlotFrame
      xDomain={[0, n]}
      yDomain={[dMin - pad, dMax + pad]}
      xTickValues={centers}
      xTickFormat={(v) => groups[Math.floor(v)]?.label ?? ""}
      yLabel={yLabel}
      title={title}
      width={width}
      height={height}
      className={className}
      grid="y"
    >
      {({ xScale, yScale }) => {
        const boxHalf = xScale(0.68) - xScale(0.5) // half box width in px
        return groups.map((g, i) => {
          const s = boxStats(g.values)
          const cx = xScale(i + 0.5)
          const fill = FILL[i % FILL.length]
          const stroke = STROKE[i % STROKE.length]
          return (
            <g key={g.label}>
              {/* whiskers */}
              <line
                x1={cx}
                x2={cx}
                y1={yScale(s.q3)}
                y2={yScale(s.upperWhisker)}
                className={stroke}
                strokeWidth={1.25}
              />
              <line
                x1={cx}
                x2={cx}
                y1={yScale(s.q1)}
                y2={yScale(s.lowerWhisker)}
                className={stroke}
                strokeWidth={1.25}
              />
              <line
                x1={cx - boxHalf * 0.5}
                x2={cx + boxHalf * 0.5}
                y1={yScale(s.upperWhisker)}
                y2={yScale(s.upperWhisker)}
                className={stroke}
                strokeWidth={1.25}
              />
              <line
                x1={cx - boxHalf * 0.5}
                x2={cx + boxHalf * 0.5}
                y1={yScale(s.lowerWhisker)}
                y2={yScale(s.lowerWhisker)}
                className={stroke}
                strokeWidth={1.25}
              />
              {/* box */}
              <rect
                x={cx - boxHalf}
                y={yScale(s.q3)}
                width={boxHalf * 2}
                height={Math.max(1, yScale(s.q1) - yScale(s.q3))}
                className={cn(fill, stroke)}
                fillOpacity={0.25}
                strokeWidth={1.5}
                rx={2}
              />
              {/* median */}
              <line
                x1={cx - boxHalf}
                x2={cx + boxHalf}
                y1={yScale(s.median)}
                y2={yScale(s.median)}
                className={stroke}
                strokeWidth={2}
              />
              {/* outliers */}
              {s.outliers.map((o, k) => (
                <circle
                  key={k}
                  cx={cx}
                  cy={yScale(o)}
                  r={2.2}
                  className={cn(fill)}
                  fillOpacity={0.8}
                />
              ))}
            </g>
          )
        })
      }}
    </PlotFrame>
  )
}
