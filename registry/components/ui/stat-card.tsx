import * as React from "react"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkline } from "@/components/ui/sparkline"

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Metric label, e.g. "Monthly revenue". */
  label: string
  /** The headline value (already formatted). */
  value: React.ReactNode
  /** Signed change; its sign drives the trend color and arrow. */
  delta?: number
  /** Unit/suffix for the delta, default "%". */
  deltaUnit?: string
  /** Caption next to the delta, e.g. "vs last month". */
  deltaLabel?: string
  /** Optional series to render as an inline sparkline. */
  data?: number[]
  /** Optional leading icon. */
  icon?: React.ReactNode
}

type Trend = "up" | "down" | "flat"

function trendOf(delta: number | undefined): Trend {
  if (delta === undefined || delta === 0) return "flat"
  return delta > 0 ? "up" : "down"
}

/**
 * A KPI tile — label, headline value, trend delta, and an optional sparkline.
 * Everything is colored through shadcn theme tokens (`primary`, `destructive`,
 * `muted-foreground`), so a StatCard automatically matches any brand theme
 * produced by shadcn-theming.
 */
export function StatCard({
  label,
  value,
  delta,
  deltaUnit = "%",
  deltaLabel,
  data,
  icon,
  className,
  ...props
}: StatCardProps) {
  const trend = trendOf(delta)
  const arrow = trend === "up" ? "▲" : trend === "down" ? "▼" : "→"

  return (
    <Card className={cn("overflow-hidden", className)} {...props}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-muted-foreground">{label}</span>
          {icon ? <span className="text-muted-foreground">{icon}</span> : null}
        </div>

        <div className="mt-2 flex items-end justify-between gap-3">
          <div className="text-2xl font-semibold tracking-tight tabular-nums">{value}</div>
          {data && data.length > 1 ? (
            <Sparkline
              data={data}
              fill
              className={cn(trend === "down" ? "text-destructive" : "text-primary")}
            />
          ) : null}
        </div>

        {delta !== undefined ? (
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium",
                trend === "up" && "bg-primary/10 text-primary",
                trend === "down" && "bg-destructive/10 text-destructive",
                trend === "flat" && "bg-muted text-muted-foreground",
              )}
            >
              <span aria-hidden>{arrow}</span>
              {Math.abs(delta)}
              {deltaUnit}
            </span>
            {deltaLabel ? <span className="text-muted-foreground">{deltaLabel}</span> : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
