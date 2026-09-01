/**
 * Client-side chart runtime built on Observable Plot (the D3 team's
 * grammar-of-graphics library). Authored as a single self-contained function
 * inlined into the page via `chartMain.toString()`; it reads the global `Plot`
 * (from the inlined vendor bundle) and draws each `[data-chart]` host, plus tiny
 * `[data-spark]` sparklines. Colors come from the theme's CSS variables.
 *
 * Plot gives us recognized, publication-quality marks: `linearRegressionY`
 * (regression + confidence band), `boxY`, `binX` (density histogram), and `cell`
 * (heatmap), with built-in interactive tips.
 */

export interface ShowcaseData {
  gdpProjection: Array<{ x: number; y: number; lower?: number; upper?: number; forecast?: boolean }>;
  growthDistribution: number[];
  phillips: Array<{ x: number; y: number }>;
  regionalGrowth: Array<{ label: string; values: number[] }>;
  macroLabels: string[];
  macroColumns: number[][];
}

export function chartMain(data: ShowcaseData): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Plot: any = (window as any).Plot;
  if (!Plot) return;

  const C = {
    c1: "var(--chart-1)",
    c4: "var(--chart-4)",
    card: "var(--card)",
    fg: "var(--foreground)",
    bg: "var(--background)",
    muted: "var(--muted-foreground)",
  };
  const seriesRange = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
  const base = () => ({
    style: { background: "transparent", color: C.muted, fontFamily: "inherit", fontSize: "11px" },
    marginTop: 16,
  });

  // --- small stats needed for KDE + correlation (Plot covers the rest) ---
  const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
  const std = (xs: number[]) => {
    const m = mean(xs);
    return Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1));
  };
  const quant = (s: number[], q: number) => {
    const p = (s.length - 1) * q;
    const lo = Math.floor(p);
    return s[lo]! + (s[Math.ceil(p)]! - s[lo]!) * (p - lo);
  };
  /** Gaussian KDE density function with Silverman bandwidth. */
  const kdeFn = (xs: number[]) => {
    const s = [...xs].sort((a, b) => a - b);
    const iqr = quant(s, 0.75) - quant(s, 0.25);
    const sig = iqr > 0 ? Math.min(std(xs), iqr / 1.349) : std(xs) || 1;
    const h = 1.06 * sig * Math.pow(xs.length, -1 / 5) || 1;
    const norm = 1 / (xs.length * h * Math.sqrt(2 * Math.PI));
    return (x: number) => {
      let sum = 0;
      for (const xi of xs) {
        const u = (x - xi) / h;
        sum += Math.exp(-0.5 * u * u);
      }
      return norm * sum;
    };
  };
  const kdeLine = (xs: number[], scale: number) => {
    const s = [...xs].sort((a, b) => a - b);
    const f = kdeFn(xs);
    const [mn, mx] = [s[0]!, s[s.length - 1]!];
    const pts: Array<{ x: number; y: number }> = [];
    for (let i = 0; i <= 100; i++) {
      const x = mn + ((mx - mn) * i) / 100;
      pts.push({ x, y: f(x) * scale });
    }
    return pts;
  };
  const pearson = (a: number[], b: number[]) => {
    const n = Math.min(a.length, b.length);
    const ma = mean(a);
    const mb = mean(b);
    let sxy = 0;
    let sxx = 0;
    let syy = 0;
    for (let i = 0; i < n; i++) {
      const dx = a[i]! - ma;
      const dy = b[i]! - mb;
      sxy += dx * dy;
      sxx += dx * dx;
      syy += dy * dy;
    }
    const d = Math.sqrt(sxx * syy);
    return d ? sxy / d : 0;
  };
  const cellColor = (r: number) =>
    `color-mix(in oklab, ${r >= 0 ? C.c1 : C.c4} ${Math.round(Math.min(Math.abs(r), 1) * 100)}%, ${C.card})`;

  // --- chart builders: (host, width) => Plot figure ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const charts: Record<string, (w: number) => any> = {
    areaband: (w) => {
      const d = data.gdpProjection;
      const banded = d.filter((p) => p.lower != null && p.upper != null);
      const history = d.filter((p) => !p.forecast);
      const ff = d.findIndex((p) => p.forecast);
      const forecast = ff === -1 ? [] : d.slice(Math.max(0, ff - 1));
      return Plot.plot({
        ...base(),
        width: w,
        height: 320,
        x: { label: null, tickFormat: "d" },
        y: { label: "% change", grid: true },
        marks: [
          Plot.ruleY([0], { stroke: C.muted, strokeOpacity: 0.4, strokeDasharray: "3,3" }),
          Plot.areaY(banded, { x: "x", y1: "lower", y2: "upper", fill: C.c1, fillOpacity: 0.15 }),
          Plot.line(history, { x: "x", y: "y", stroke: C.c1, strokeWidth: 2 }),
          Plot.line(forecast, { x: "x", y: "y", stroke: C.c1, strokeWidth: 2, strokeDasharray: "5,4" }),
          Plot.dot(d, { x: "x", y: "y", fill: C.c1, r: 2.5, fillOpacity: (p: { forecast?: boolean }) => (p.forecast ? 0.5 : 1), tip: true, title: (p: { x: number; y: number; forecast?: boolean }) => `${p.x}: ${p.y}%${p.forecast ? " (proj.)" : ""}` }),
        ],
      });
    },
    histogram: (w) => {
      const xs = data.growthDistribution;
      const rows = xs.map((v) => ({ v }));
      const bins = Math.max(1, Math.round(Math.sqrt(xs.length)));
      const binWidth = (Math.max(...xs) - Math.min(...xs)) / bins || 1;
      return Plot.plot({
        ...base(),
        width: w,
        height: 300,
        x: { label: "% growth" },
        y: { label: "Count", grid: true },
        marks: [
          Plot.rectY(rows, Plot.binX({ y: "count" }, { x: "v", thresholds: bins, fill: C.c1, fillOpacity: 0.7, tip: true })),
          Plot.lineY(kdeLine(xs, xs.length * binWidth), { x: "x", y: "y", stroke: C.c1, strokeWidth: 2, curve: "basis" }),
        ],
      });
    },
    scatter: (w) => {
      const d = data.phillips;
      return Plot.plot({
        ...base(),
        width: w,
        height: 300,
        x: { label: "Unemployment (%)", grid: true },
        y: { label: "Inflation (%)", grid: true },
        marks: [
          Plot.linearRegressionY(d, { x: "x", y: "y", stroke: C.c1, fill: C.c1, fillOpacity: 0.12 }),
          Plot.dot(d, { x: "x", y: "y", fill: C.c1, fillOpacity: 0.65, r: 3, tip: true }),
        ],
      });
    },
    boxplot: (w) => {
      const rows = data.regionalGrowth.flatMap((g) => g.values.map((v) => ({ group: g.label, v })));
      return Plot.plot({
        ...base(),
        width: w,
        height: 300,
        x: { label: null, tickSize: 0 },
        y: { label: "% growth", grid: true },
        color: { domain: data.regionalGrowth.map((g) => g.label), range: seriesRange },
        marks: [Plot.boxY(rows, { x: "group", y: "v", fill: "group", fillOpacity: 0.6, stroke: C.fg, strokeOpacity: 0.7 })],
      });
    },
    heatmap: (w) => {
      const labels = data.macroLabels;
      const cols = data.macroColumns;
      const cells: Array<{ a: string; b: string; r: number }> = [];
      for (let i = 0; i < labels.length; i++) {
        for (let j = 0; j < labels.length; j++) {
          cells.push({ a: labels[i]!, b: labels[j]!, r: i === j ? 1 : pearson(cols[i]!, cols[j]!) });
        }
      }
      return Plot.plot({
        ...base(),
        width: Math.min(w, 460),
        height: Math.min(w, 460),
        marginLeft: 96,
        marginBottom: 96,
        x: { label: null, domain: labels, tickRotate: -45 },
        y: { label: null, domain: labels },
        color: { type: "identity" },
        marks: [
          Plot.cell(cells, { x: "b", y: "a", fill: (d: { r: number }) => cellColor(d.r), inset: 0.5, rx: 2, tip: true, channels: { r: "r" } }),
          Plot.text(cells, { x: "b", y: "a", text: (d: { r: number }) => d.r.toFixed(2), fill: (d: { r: number }) => (Math.abs(d.r) > 0.55 ? C.bg : C.fg), fontSize: 10 }),
        ],
      });
    },
  };

  const sparkline = (values: number[], color: string) => {
    const rows = values.map((y, i) => ({ i, y }));
    return Plot.plot({
      width: 96,
      height: 30,
      margin: 0,
      axis: null,
      x: { axis: null },
      y: { axis: null },
      style: { background: "transparent" },
      marks: [
        Plot.areaY(rows, { x: "i", y: "y", fill: color, fillOpacity: 0.12 }),
        Plot.lineY(rows, { x: "i", y: "y", stroke: color, strokeWidth: 1.5 }),
      ],
    });
  };

  const renderChart = (host: HTMLElement) => {
    const kind = host.dataset.chart!;
    if (!charts[kind]) return;
    try {
      const width = Math.max(240, host.clientWidth || 520);
      const title = host.dataset.title;
      const fig = charts[kind]!(width);
      if (title) {
        const h = document.createElement("div");
        h.className = "plot-title";
        h.textContent = title;
        host.replaceChildren(h, fig);
      } else {
        host.replaceChildren(fig);
      }
    } catch (err) {
      // Isolate failures so one bad chart can't blank the rest of the page.
      console.error(`chart "${kind}" failed`, err);
    }
  };

  const draw = () => {
    document.querySelectorAll<HTMLElement>("[data-chart]").forEach(renderChart);
    document.querySelectorAll<HTMLElement>("[data-spark]").forEach((host) => {
      try {
        const values = JSON.parse(host.dataset.spark!) as number[];
        host.replaceChildren(sparkline(values, host.dataset.trend === "down" ? "var(--destructive)" : "var(--chart-1)"));
      } catch (err) {
        console.error("sparkline failed", err);
      }
    });
  };

  draw();

  // Responsive: re-render on resize (debounced) and when the theme toggles.
  let timer = 0;
  window.addEventListener("resize", () => {
    clearTimeout(timer);
    timer = window.setTimeout(draw, 180);
  });
}
