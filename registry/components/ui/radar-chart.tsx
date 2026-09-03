"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

const PALETTE = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]

export interface RadarSeries {
  name: string
  /** One value per axis, in `axes` order, on the `[0, max]` scale. */
  values: number[]
}

export interface RadarChartProps {
  axes: string[]
  series: RadarSeries[]
  /** Top of the scale. Default 100. */
  max?: number
  title?: string
  /** Square drawing size in px (viewBox). Default 380. */
  size?: number
  /** Show the series legend. Default true. */
  legend?: boolean
  className?: string
}

/**
 * A radar (spider) chart — a dependency-free SVG for comparing a handful of
 * normalized metrics across one or more series. Colors come from theme tokens.
 */
export function RadarChart({ axes, series, max = 100, title, size = 380, legend = true, className }: RadarChartProps) {
  const n = axes.length
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 46
  const ang = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n
  const at = (i: number, radius: number): [number, number] => [cx + Math.cos(ang(i)) * radius, cy + Math.sin(ang(i)) * radius]
  const rings = [0.25, 0.5, 0.75, 1]

  return (
    <figure className={cn("m-0", className)}>
      {title ? <figcaption style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: "var(--foreground)" }}>{title}</figcaption> : null}
      <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ maxWidth: size, fontFamily: "inherit" }} role="img" aria-label={title ?? "Radar chart"}>
        {rings.map((f, i) => (
          <polygon key={i} points={axes.map((_, a) => at(a, r * f).join(",")).join(" ")} fill="none" stroke="var(--border)" strokeOpacity={0.8} />
        ))}
        {axes.map((label, i) => {
          const [x, y] = at(i, r)
          const [lx, ly] = at(i, r + 16)
          const anchor = Math.abs(lx - cx) < 4 ? "middle" : lx > cx ? "start" : "end"
          return (
            <g key={label}>
              <line x1={cx} y1={cy} x2={x} y2={y} stroke="var(--border)" />
              <text x={lx} y={ly + 3} textAnchor={anchor} fontSize={10} fill="var(--muted-foreground)">
                {label}
              </text>
            </g>
          )
        })}
        {series.map((s, si) => {
          const color = PALETTE[si % PALETTE.length]
          const pts = s.values.map((v, i) => at(i, (r * Math.max(0, Math.min(max, v))) / max).join(",")).join(" ")
          return (
            <g key={s.name}>
              <polygon points={pts} fill={color} fillOpacity={0.18} stroke={color} strokeWidth={2} />
              {s.values.map((v, i) => {
                const [x, y] = at(i, (r * Math.max(0, Math.min(max, v))) / max)
                return <circle key={i} cx={x} cy={y} r={2.6} fill={color} />
              })}
            </g>
          )
        })}
      </svg>
      {legend ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: 8 }}>
          {series.map((s, si) => (
            <span key={s.name} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--muted-foreground)" }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: PALETTE[si % PALETTE.length] }} />
              {s.name}
            </span>
          ))}
        </div>
      ) : null}
    </figure>
  )
}
