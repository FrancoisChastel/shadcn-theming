---
name: shadcn-theming-components
description: >-
  Install and use the shadcn-theming registry components — token-driven React
  components that shadcn/ui doesn't ship: KPI tiles (stat-card, sparkline) and a
  full chart set built on Observable Plot / d3 (histogram+KDE, box plot,
  scatter+regression, area/fan band, correlation heatmap, line/time-series,
  grouped/stacked bar, donut, bullet). Use this whenever the user wants to add a
  chart, KPI, sparkline, or data-viz component to a shadcn/ui app, asks how to
  install one of these components, or wants dashboard/analytics UI that matches
  their brand theme.
license: MIT
metadata:
  version: 0.1.0
  homepage: https://github.com/FrancoisChastel/shadcn-theming
allowed-tools: Bash, Read, Edit, Write, Grep, Glob
---

# shadcn-theming-components

A set of installable, **theme-token-driven** React components for shadcn/ui —
the pieces shadcn doesn't include. Every component colors itself through the
theme's CSS variables (`--primary`, `--chart-1..5`, `--muted-foreground`, …), so
it automatically matches whatever brand theme is applied (see the sibling
`shadcn-theming` skill for generating/applying themes).

## Install

Each component installs into a shadcn/ui project (Tailwind v4) with the shadcn
CLI. Dependencies (`@observablehq/plot`, `d3-shape`) and the shared libs
(`use-plot`, `stats`) resolve automatically.

```bash
RAW=https://raw.githubusercontent.com/FrancoisChastel/shadcn-theming/main/registry
npx shadcn@latest add $RAW/stat-card.json
npx shadcn@latest add $RAW/line-chart.json
npx shadcn@latest add $RAW/scatter-plot.json
```

Prerequisite: the target project must be an initialized shadcn/ui project
(`components.json` present, `@/lib/utils` `cn` available). If not, run
`npx shadcn@latest init` first.

## Components

Install name → import. All live under `@/components/ui/<name>`.

| Install | Component | Use for |
| --- | --- | --- |
| `sparkline` | `Sparkline` | Inline trend line in a cell/tile. |
| `stat-card` | `StatCard` | KPI tile: value + trend delta + sparkline. |
| `line-chart` | `LineChart` | Multi-series time series. |
| `bar-chart` | `BarChart` | Grouped or stacked bars (`stacked` prop). |
| `donut-chart` | `DonutChart` | Composition donut with legend + center label. |
| `bullet-chart` | `BulletChart` | KPI vs target. |
| `histogram` | `Histogram` | Distribution + optional KDE overlay. |
| `box-plot` | `BoxPlot` | Grouped Tukey box plots. |
| `scatter-plot` | `ScatterPlot` | Scatter + OLS regression + 95% band. |
| `area-band` | `AreaBand` | Line with confidence/projection band (fan chart). |
| `correlation-heatmap` | `CorrelationHeatmap` | Correlation matrix. |

## Usage

```tsx
import { StatCard } from "@/components/ui/stat-card"
import { LineChart } from "@/components/ui/line-chart"
import { BarChart } from "@/components/ui/bar-chart"
import { DonutChart } from "@/components/ui/donut-chart"
import { ScatterPlot } from "@/components/ui/scatter-plot"
import { AreaBand } from "@/components/ui/area-band"

<StatCard label="Revenue" value="$48.2k" delta={12.5} deltaLabel="MoM" data={series} />

<LineChart
  title="Growth by region"
  xTickFormat="d"
  series={[
    { name: "Advanced", points: adv.map((v, i) => ({ x: years[i], y: v })) },
    { name: "Emerging", points: emg.map((v, i) => ({ x: years[i], y: v })) },
  ]}
/>

<BarChart stacked data={[{ group: "Q1", series: "New", value: 12 }, /* … */]} />

<DonutChart data={[{ label: "USD", value: 58 }, /* … */]} centerSub="reserves" />

<ScatterPlot data={points} regression title="Phillips curve" xLabel="Unemployment" yLabel="Inflation" />

<AreaBand data={[{ x: 2024, y: 3.2 }, { x: 2025, y: 3.1, lower: 2.8, upper: 3.4, forecast: true }]} />
```

## Rules for using these

- **Don't hardcode colors.** Pass theme tokens (`var(--chart-2)`, `text-chart-1`)
  or rely on the defaults — the components already read the palette. This keeps
  them on-brand in light and dark.
- **Charts are client components** (`"use client"`). In Next.js App Router,
  render them in a client boundary or a component that is itself client.
- **Sizing is responsive** via a `usePlot` `ResizeObserver`; wrap a chart in a
  sized container (e.g. a `Card` with a fixed height) to control its height, or
  pass the `height` prop.
- **Data shape matters** — check each component's exported prop types before
  passing data; they're small and explicit.
- To also brand the whole app, generate + apply a theme first with
  `npx shadcn-theming` (see the `shadcn-theming` skill), then these components
  inherit it automatically.

## References

- `references/components.md` — the full prop reference for every component.
- Live preview of all of them in a brand theme:
  `npx shadcn-theming explore brand.json -o site` → open `site/charts.html`.
