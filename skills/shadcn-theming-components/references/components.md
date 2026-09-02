# Component prop reference

All components accept `className` and are colored from theme tokens by default.
Charts accept a `title` (rendered as a `<figcaption>`).

## KPI

### `Sparkline`
`data: number[]` · `width?=100` · `height?=28` · `strokeWidth?=1.5` ·
`fill?=false` · `showLastDot?=true`. Inherits `text-primary`; set
`className="text-chart-2"` to recolor.

### `StatCard`
`label: string` · `value: ReactNode` · `delta?: number` (sign drives color) ·
`deltaUnit?="%"` · `deltaLabel?: string` · `data?: number[]` (inline sparkline) ·
`icon?: ReactNode`. Depends on shadcn `card` + `sparkline`.

## Business charts

### `LineChart`
`series: { name: string; points: { x: number; y: number }[] }[]` · `title?` ·
`xLabel?` · `yLabel?` · `height?=300` · `xTickFormat?: string` (e.g. `"d"` for
integer years) · `dots?=false`. Multi-series with a color legend.

### `BarChart`
`data: { group: string; series: string; value: number }[]` · `stacked?=false`
(false = grouped) · `title?` · `yLabel?` · `height?=300`.

### `DonutChart`
`data: { label: string; value: number }[]` · `title?` · `centerLabel?` (default
= total) · `centerSub?` · `size?=240`. Uses `d3-shape`; renders a legend.

### `BulletChart`
`data: { label: string; value: number; target: number; max: number; unit? }[]`
· `title?` · `color?="var(--chart-1)"`. Track + actual bar + target tick per row.

## Scientific charts

### `Histogram`
`data: number[]` · `kde?=true` · `title?` · `xLabel?` · `height?=300` ·
`color?="var(--chart-1)"`. Count histogram + optional KDE overlay.

### `BoxPlot`
`groups: { label: string; values: number[] }[]` · `title?` · `yLabel?` ·
`height?=300`. Grouped Tukey boxes; each group cycles the palette.

### `ScatterPlot`
`data: { x: number; y: number }[]` · `regression?=true` (OLS line + 95% band) ·
`title?` · `xLabel?` · `yLabel?` · `height?=300` · `color?`.

### `AreaBand`
`data: { x; y; lower?; upper?; forecast? }[]` · `title?` · `yLabel?` ·
`zeroLine?=true` · `height?=300` · `color?`. History = solid, forecast = dashed,
band drawn where `lower`/`upper` are present (WEO fan-chart idiom).

### `CorrelationHeatmap`
`labels: string[]` · `matrix?: number[][]` **or** `columns?: number[][]`
(computes Pearson) · `title?` · `annotate?=true` · `height?`. Diverging scale:
`+1 → --chart-1`, `-1 → --chart-4`.

## Shared libs (installed automatically)

- `use-plot` — `usePlot(render, deps)`: renders an Observable Plot figure into a
  responsive container.
- `stats` — `gaussianKDE`, `silvermanBandwidth`, `correlationMatrix`, `pearson`.

## Notes

- All charts are `"use client"`.
- Colors: pass any CSS color, including a token like `var(--chart-3)`. Ordinal
  series use the `--chart-1..5` ramp.
- Responsive height: pass `height`, or wrap in a fixed-height container.
