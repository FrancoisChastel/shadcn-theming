/**
 * Server-side SVG builders that mirror the React scientific-chart components,
 * reusing the SAME statistics library so the math is single-sourced. These
 * power the self-contained HTML showcase (zero-dependency, screenshot-friendly)
 * while the React components in `registry/` remain the distributable source.
 *
 * Colors are emitted as `var(--token)` so every chart tracks the injected theme.
 */
import {
  histogramBins,
  gaussianKDE,
  boxStats,
  linearRegression,
  correlationMatrix,
  linearScale,
  niceTicks,
  extent,
} from "../../registry/components/lib/stats.js";

interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface FrameOptions {
  width?: number;
  height?: number;
  margin?: Margin;
  title?: string;
  xLabel?: string;
  yLabel?: string;
  xDomain: [number, number];
  yDomain: [number, number];
  xTicks?: number[];
  yTicks?: number[];
  xTickFormat?: (v: number) => string;
  yTickFormat?: (v: number) => string;
  grid?: "y" | "both" | "none";
}

interface Scales {
  x: (v: number) => number;
  y: (v: number) => number;
  innerWidth: number;
  innerHeight: number;
}

const DEFAULT_MARGIN: Margin = { top: 30, right: 16, bottom: 42, left: 50 };
const fmt = (v: number) =>
  Math.abs(v) >= 1000 ? v.toLocaleString() : Number.isInteger(v) ? String(v) : v.toFixed(1);

/** Shared seaborn-style frame; `marks(scales)` returns the inner SVG markup. */
function frame(opts: FrameOptions, marks: (s: Scales) => string): string {
  const width = opts.width ?? 520;
  const height = opts.height ?? 320;
  const m = opts.margin ?? DEFAULT_MARGIN;
  const innerWidth = width - m.left - m.right;
  const innerHeight = height - m.top - m.bottom;
  const x = linearScale(opts.xDomain, [0, innerWidth]);
  const y = linearScale(opts.yDomain, [innerHeight, 0]);
  const xTicks = opts.xTicks ?? niceTicks(opts.xDomain[0], opts.xDomain[1], 6);
  const yTicks = opts.yTicks ?? niceTicks(opts.yDomain[0], opts.yDomain[1], 5);
  const xf = opts.xTickFormat ?? fmt;
  const yf = opts.yTickFormat ?? fmt;
  const grid = opts.grid ?? "y";

  const yGrid = yTicks
    .map(
      (t) =>
        `<line x1="0" x2="${innerWidth}" y1="${y(t).toFixed(2)}" y2="${y(t).toFixed(2)}" stroke="var(--border)" stroke-opacity="0.6"/>`,
    )
    .join("");
  const xGrid =
    grid === "both"
      ? xTicks
          .map(
            (t) =>
              `<line x1="${x(t).toFixed(2)}" x2="${x(t).toFixed(2)}" y1="0" y2="${innerHeight}" stroke="var(--border)" stroke-opacity="0.6"/>`,
          )
          .join("")
      : "";
  const xTickLabels = xTicks
    .map(
      (t) =>
        `<text x="${x(t).toFixed(2)}" y="${innerHeight + 18}" text-anchor="middle" fill="var(--muted-foreground)" font-size="11">${xf(t)}</text>`,
    )
    .join("");
  const yTickLabels = yTicks
    .map(
      (t) =>
        `<text x="-8" y="${y(t).toFixed(2)}" dy="0.32em" text-anchor="end" fill="var(--muted-foreground)" font-size="11">${yf(t)}</text>`,
    )
    .join("");

  return `<svg viewBox="0 0 ${width} ${height}" class="plot" role="img" aria-label="${opts.title ?? "chart"}">
    ${opts.title ? `<text x="${m.left}" y="${m.top - 12}" fill="var(--foreground)" font-size="13" font-weight="500">${opts.title}</text>` : ""}
    <g transform="translate(${m.left},${m.top})">
      ${grid !== "none" ? yGrid : ""}${xGrid}
      ${marks({ x, y, innerWidth, innerHeight })}
      <line x1="0" x2="${innerWidth}" y1="${innerHeight}" y2="${innerHeight}" stroke="var(--border)"/>
      ${xTickLabels}${yTickLabels}
      ${opts.xLabel ? `<text x="${innerWidth / 2}" y="${innerHeight + 36}" text-anchor="middle" fill="var(--muted-foreground)" font-size="11">${opts.xLabel}</text>` : ""}
      ${opts.yLabel ? `<text transform="translate(-40,${innerHeight / 2}) rotate(-90)" text-anchor="middle" fill="var(--muted-foreground)" font-size="11">${opts.yLabel}</text>` : ""}
    </g>
  </svg>`;
}

const path = (pts: Array<[number, number]>) =>
  pts.map(([px, py], i) => `${i ? "L" : "M"}${px.toFixed(2)},${py.toFixed(2)}`).join(" ");

/** Histogram + Gaussian KDE overlay. */
export function svgHistogram(data: number[], title: string, xLabel: string): string {
  const bins = histogramBins(data);
  const [xMin, xMax] = extent(data);
  let yMax = Math.max(...bins.map((b) => b.density));
  const kde = gaussianKDE(data);
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= 96; i++) {
    const xv = xMin + ((xMax - xMin) * i) / 96;
    const yv = kde(xv);
    pts.push([xv, yv]);
    if (yv > yMax) yMax = yv;
  }
  yMax *= 1.1;
  return frame(
    { xDomain: [xMin, xMax], yDomain: [0, yMax], title, xLabel, yLabel: "Density" },
    ({ x, y, innerHeight }) => {
      const bars = bins
        .map((b) => {
          const bx = x(b.x0);
          const bw = Math.max(0, x(b.x1) - x(b.x0) - 1);
          const by = y(b.density);
          return `<rect x="${bx.toFixed(2)}" y="${by.toFixed(2)}" width="${bw.toFixed(2)}" height="${Math.max(0, innerHeight - by).toFixed(2)}" fill="var(--chart-1)" fill-opacity="0.7" rx="1"/>`;
        })
        .join("");
      const curve = `<path d="${path(pts.map(([px, py]) => [x(px), y(py)]))}" fill="none" stroke="var(--chart-1)" stroke-width="2"/>`;
      return bars + curve;
    },
  );
}

/** Grouped Tukey box plots. */
export function svgBoxPlot(
  groups: Array<{ label: string; values: number[] }>,
  title: string,
  yLabel: string,
): string {
  const all = groups.flatMap((g) => g.values);
  const [dMin, dMax] = extent(all);
  const pad = (dMax - dMin) * 0.08 || 1;
  const n = groups.length;
  const centers = groups.map((_, i) => i + 0.5);
  const colors = (i: number) => `var(--chart-${(i % 5) + 1})`;
  return frame(
    {
      xDomain: [0, n],
      yDomain: [dMin - pad, dMax + pad],
      title,
      yLabel,
      xTicks: centers,
      xTickFormat: (v) => groups[Math.floor(v)]?.label ?? "",
    },
    ({ x, y }) => {
      const half = x(0.68) - x(0.5);
      return groups
        .map((g, i) => {
          const s = boxStats(g.values);
          const cx = x(i + 0.5);
          const c = colors(i);
          const cap = (yy: number) =>
            `<line x1="${(cx - half * 0.5).toFixed(2)}" x2="${(cx + half * 0.5).toFixed(2)}" y1="${y(yy).toFixed(2)}" y2="${y(yy).toFixed(2)}" stroke="${c}" stroke-width="1.25"/>`;
          const outliers = s.outliers
            .map((o) => `<circle cx="${cx.toFixed(2)}" cy="${y(o).toFixed(2)}" r="2.2" fill="${c}" fill-opacity="0.8"/>`)
            .join("");
          return `
            <line x1="${cx.toFixed(2)}" x2="${cx.toFixed(2)}" y1="${y(s.q3).toFixed(2)}" y2="${y(s.upperWhisker).toFixed(2)}" stroke="${c}" stroke-width="1.25"/>
            <line x1="${cx.toFixed(2)}" x2="${cx.toFixed(2)}" y1="${y(s.q1).toFixed(2)}" y2="${y(s.lowerWhisker).toFixed(2)}" stroke="${c}" stroke-width="1.25"/>
            ${cap(s.upperWhisker)}${cap(s.lowerWhisker)}
            <rect x="${(cx - half).toFixed(2)}" y="${y(s.q3).toFixed(2)}" width="${(half * 2).toFixed(2)}" height="${Math.max(1, y(s.q1) - y(s.q3)).toFixed(2)}" fill="${c}" fill-opacity="0.25" stroke="${c}" stroke-width="1.5" rx="2"/>
            <line x1="${(cx - half).toFixed(2)}" x2="${(cx + half).toFixed(2)}" y1="${y(s.median).toFixed(2)}" y2="${y(s.median).toFixed(2)}" stroke="${c}" stroke-width="2"/>
            ${outliers}`;
        })
        .join("");
    },
  );
}

/** Scatter with OLS regression line + 95% confidence band. */
export function svgScatter(
  data: Array<{ x: number; y: number }>,
  title: string,
  xLabel: string,
  yLabel: string,
): string {
  const xs = data.map((d) => d.x);
  const ys = data.map((d) => d.y);
  const [xMin, xMax] = extent(xs);
  const [yMin, yMax] = extent(ys);
  const xPad = (xMax - xMin) * 0.05 || 1;
  const yPad = (yMax - yMin) * 0.08 || 1;
  const xDomain: [number, number] = [xMin - xPad, xMax + xPad];
  const yDomain: [number, number] = [yMin - yPad, yMax + yPad];
  const reg = linearRegression(xs, ys);
  const line: Array<[number, number]> = [];
  const up: Array<[number, number]> = [];
  const lo: Array<[number, number]> = [];
  for (let i = 0; i <= 48; i++) {
    const xv = xDomain[0] + ((xDomain[1] - xDomain[0]) * i) / 48;
    const yhat = reg.predict(xv);
    const ci = 1.96 * reg.seMean(xv);
    line.push([xv, yhat]);
    up.push([xv, yhat + ci]);
    lo.push([xv, yhat - ci]);
  }
  return frame(
    { xDomain, yDomain, title, xLabel, yLabel, grid: "both" },
    ({ x, y }) => {
      const bandPts = [...up.map(([px, py]) => [x(px), y(py)] as [number, number]), ...lo.reverse().map(([px, py]) => [x(px), y(py)] as [number, number])];
      const band = `<path d="${path(bandPts)} Z" fill="var(--chart-1)" fill-opacity="0.12"/>`;
      const dots = data
        .map((d) => `<circle cx="${x(d.x).toFixed(2)}" cy="${y(d.y).toFixed(2)}" r="3" fill="var(--chart-1)" fill-opacity="0.65"/>`)
        .join("");
      const fit = `<path d="${path(line.map(([px, py]) => [x(px), y(py)]))}" fill="none" stroke="var(--chart-1)" stroke-width="2"/>`;
      const r2 = `<text x="6" y="12" fill="var(--muted-foreground)" font-size="11">R² = ${reg.r2.toFixed(3)}</text>`;
      return band + dots + fit + r2;
    },
  );
}

/** Line with confidence/projection band and dashed forecast (WEO fan chart). */
export function svgAreaBand(
  data: Array<{ x: number; y: number; lower?: number; upper?: number; forecast?: boolean }>,
  title: string,
  yLabel: string,
  xTickFormat?: (v: number) => string,
): string {
  const xs = data.map((d) => d.x);
  const ysAll = data.flatMap((d) => [d.y, d.lower ?? d.y, d.upper ?? d.y]);
  const [xMin, xMax] = extent(xs);
  const [yMin, yMax] = extent(ysAll);
  const yPad = (yMax - yMin) * 0.1 || 1;
  const yDomain: [number, number] = [Math.min(yMin - yPad, 0), yMax + yPad];
  const banded = data.filter((d) => d.lower !== undefined && d.upper !== undefined);
  const firstForecast = data.findIndex((d) => d.forecast);
  const history = firstForecast === -1 ? data : data.slice(0, firstForecast + 1);
  const forecast = firstForecast === -1 ? [] : data.slice(Math.max(0, firstForecast - 1));
  return frame(
    { xDomain: [xMin, xMax], yDomain, title, yLabel, ...(xTickFormat ? { xTickFormat } : {}) },
    ({ x, y, innerWidth }) => {
      const zero =
        yDomain[0] < 0 && yDomain[1] > 0
          ? `<line x1="0" x2="${innerWidth}" y1="${y(0).toFixed(2)}" y2="${y(0).toFixed(2)}" stroke="var(--muted-foreground)" stroke-opacity="0.4" stroke-dasharray="3 3"/>`
          : "";
      const band =
        banded.length > 1
          ? `<path d="${path([...banded.map((d) => [x(d.x), y(d.upper!)] as [number, number]), ...[...banded].reverse().map((d) => [x(d.x), y(d.lower!)] as [number, number])])} Z" fill="var(--chart-1)" fill-opacity="0.15"/>`
          : "";
      const hist = `<path d="${path(history.map((d) => [x(d.x), y(d.y)]))}" fill="none" stroke="var(--chart-1)" stroke-width="2"/>`;
      const fc =
        forecast.length > 1
          ? `<path d="${path(forecast.map((d) => [x(d.x), y(d.y)]))}" fill="none" stroke="var(--chart-1)" stroke-width="2" stroke-dasharray="5 4"/>`
          : "";
      const dots = data
        .map((d) => `<circle cx="${x(d.x).toFixed(2)}" cy="${y(d.y).toFixed(2)}" r="2.5" fill="var(--chart-1)" fill-opacity="${d.forecast ? 0.5 : 1}"/>`)
        .join("");
      return zero + band + hist + fc + dots;
    },
  );
}

/** Correlation matrix heatmap with a theme-derived diverging scale. */
export function svgHeatmap(labels: string[], columns: number[][], title: string): string {
  const m = correlationMatrix(columns);
  const n = labels.length;
  const width = 420;
  const height = 420;
  const margin = { top: 34, right: 12, bottom: 84, left: 90 };
  const size = Math.min(width - margin.left - margin.right, height - margin.top - margin.bottom);
  const cell = size / n;
  const color = (v: number) => {
    const pct = Math.round(Math.min(Math.abs(v), 1) * 100);
    const end = v >= 0 ? "var(--chart-1)" : "var(--chart-4)";
    return `color-mix(in oklab, ${end} ${pct}%, var(--card))`;
  };
  const textFill = (v: number) => (Math.abs(v) > 0.55 ? "var(--background)" : "var(--foreground)");
  const cells = m
    .map((row, i) =>
      row
        .map((v, j) => {
          const cx = j * cell;
          const cy = i * cell;
          return `<rect x="${cx.toFixed(2)}" y="${cy.toFixed(2)}" width="${(cell - 1.5).toFixed(2)}" height="${(cell - 1.5).toFixed(2)}" rx="2" fill="${color(v)}"/>
            <text x="${(cx + cell / 2).toFixed(2)}" y="${(cy + cell / 2).toFixed(2)}" dy="0.32em" text-anchor="middle" font-size="10" fill="${textFill(v)}">${v.toFixed(2)}</text>`;
        })
        .join(""),
    )
    .join("");
  const rowLabels = labels
    .map(
      (l, i) =>
        `<text x="-8" y="${(i * cell + cell / 2).toFixed(2)}" dy="0.32em" text-anchor="end" fill="var(--muted-foreground)" font-size="11">${l}</text>`,
    )
    .join("");
  const colLabels = labels
    .map(
      (l, j) =>
        `<text transform="translate(${(j * cell + cell / 2).toFixed(2)},${(n * cell + 10).toFixed(2)}) rotate(-45)" text-anchor="end" fill="var(--muted-foreground)" font-size="11">${l}</text>`,
    )
    .join("");
  return `<svg viewBox="0 0 ${width} ${height}" class="plot" role="img" aria-label="${title}">
    <text x="${margin.left}" y="20" fill="var(--foreground)" font-size="13" font-weight="500">${title}</text>
    <g transform="translate(${margin.left},${margin.top})">${cells}${rowLabels}${colLabels}</g>
  </svg>`;
}
