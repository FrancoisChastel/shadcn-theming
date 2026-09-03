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
  regionSeries: Array<{ region: string; points: Array<{ year: number; value: number }> }>;
  groupedBars: Array<{ region: string; series: string; value: number }>;
  divergingCA: Array<{ country: string; value: number }>;
  donutParts: Array<{ label: string; value: number }>;
  bulletKpis: Array<{ label: string; value: number; target: number; max: number; unit: string }>;
  weoFan: Array<{ x: number; median: number; forecast: boolean; b50: [number, number]; b80: [number, number]; b90: [number, number] }>;
  growthContributions: Array<{ label: string; value: number }>;
  slopeRanks: Array<{ item: string; left: number; right: number }>;
  phillipsPath: Array<{ year: number; x: number; y: number }>;
  radarProfiles: { axes: string[]; series: Array<{ name: string; values: number[] }> };
  incomeDistribution: number[];
  ohlc: Array<{ t: number; o: number; h: number; l: number; c: number }>;
}

export function chartMain(data: ShowcaseData): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Plot: any = (window as any).Plot;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d3: any = (window as any).d3;
  const NS = "http://www.w3.org/2000/svg";
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

  // --- tiny SVG builders for the hand-drawn charts (violin, radar) ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const el = (tag: string, attrs: Record<string, any> = {}, text?: string) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, String(attrs[k]));
    if (text != null) n.textContent = text;
    return n;
  };
  const svgRoot = (vbW: number, vbH: number) => {
    const s = el("svg", { viewBox: `0 0 ${vbW} ${vbH}`, class: "plot", "aria-hidden": "true" });
    return s as SVGSVGElement;
  };

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
    timeseries: (w) => {
      const rows = data.regionSeries.flatMap((s) => s.points.map((p) => ({ region: s.region, year: p.year, value: p.value })));
      return Plot.plot({
        ...base(),
        width: w,
        height: 320,
        x: { label: null, tickFormat: "d" },
        y: { label: "% growth", grid: true },
        color: { domain: data.regionSeries.map((s) => s.region), range: seriesRange, legend: true },
        marks: [
          Plot.ruleY([0], { stroke: C.muted, strokeOpacity: 0.3 }),
          Plot.lineY(rows, { x: "year", y: "value", stroke: "region", strokeWidth: 2, tip: true }),
        ],
      });
    },
    "bar-grouped": (w) =>
      Plot.plot({
        ...base(),
        width: w,
        height: 320,
        x: { axis: null },
        fx: { label: null },
        y: { label: "%", grid: true },
        color: { domain: ["GDP growth", "Inflation", "Unemployment"], range: seriesRange, legend: true },
        marks: [Plot.barY(data.groupedBars, { x: "series", y: "value", fx: "region", fill: "series", tip: true }), Plot.ruleY([0])],
      }),
    "bar-stacked": (w) =>
      Plot.plot({
        ...base(),
        width: w,
        height: 320,
        x: { label: null },
        y: { label: "%", grid: true },
        color: { domain: ["GDP growth", "Inflation", "Unemployment"], range: seriesRange, legend: true },
        marks: [Plot.barY(data.groupedBars, { x: "region", y: "value", fill: "series", tip: true }), Plot.ruleY([0])],
      }),
    diverging: (w) =>
      Plot.plot({
        ...base(),
        width: w,
        height: 320,
        marginLeft: 72,
        x: { label: "Current account (% GDP)", grid: true },
        y: { label: null, domain: data.divergingCA.map((d) => d.country) },
        color: { type: "identity" },
        marks: [
          Plot.barX(data.divergingCA, { x: "value", y: "country", fill: (d: { value: number }) => (d.value >= 0 ? C.c1 : C.c4), tip: true }),
          Plot.ruleX([0], { stroke: C.fg, strokeOpacity: 0.5 }),
        ],
      }),
    "area-stacked": (w) => {
      const rows = data.regionSeries.flatMap((s) => s.points.map((p) => ({ region: s.region, year: p.year, value: Math.max(0, p.value) })));
      return Plot.plot({
        ...base(),
        width: w,
        height: 320,
        x: { label: null, tickFormat: "d" },
        y: { label: "%", grid: true },
        color: { domain: data.regionSeries.map((s) => s.region), range: seriesRange, legend: true },
        marks: [Plot.areaY(rows, { x: "year", y: "value", fill: "region", fillOpacity: 0.85, tip: true }), Plot.ruleY([0])],
      });
    },
    bullet: (w) => {
      const rows = data.bulletKpis;
      return Plot.plot({
        ...base(),
        width: w,
        height: 46 * rows.length + 26,
        marginLeft: 96,
        x: { label: null, grid: true },
        y: { label: null, domain: rows.map((r) => r.label) },
        marks: [
          Plot.barX(rows, { x: "max", y: "label", fill: "var(--muted)" }),
          Plot.barX(rows, { x: "value", y: "label", fill: C.c1, inset: 8, tip: true, title: (d: { label: string; value: number; unit: string; target: number }) => `${d.label}: ${d.value}${d.unit} (target ${d.target})` }),
          Plot.tickX(rows, { x: "target", y: "label", stroke: C.fg, strokeWidth: 2 }),
        ],
      });
    },
    lollipop: (w) => {
      const rows = [...data.divergingCA].sort((a, b) => a.value - b.value);
      return Plot.plot({
        ...base(),
        width: w,
        height: 320,
        marginLeft: 72,
        x: { label: "Current account (% GDP)", grid: true },
        y: { label: null, domain: rows.map((r) => r.country) },
        marks: [
          Plot.ruleY(rows, { y: "country", x1: 0, x2: "value", stroke: C.muted }),
          Plot.dot(rows, { x: "value", y: "country", fill: C.c1, r: 4, tip: true }),
        ],
      });
    },
    fanchart: (w) => {
      const d = data.weoFan;
      const hist = d.filter((p) => !p.forecast);
      const fc = d.filter((p) => p.forecast);
      const bridge = hist.length ? [hist[hist.length - 1]!, ...fc] : fc;
      const band = (key: "b50" | "b80" | "b90") => bridge.map((p) => ({ x: p.x, lo: p[key][0], hi: p[key][1] }));
      return Plot.plot({
        ...base(),
        width: w,
        height: 320,
        x: { label: null, tickFormat: "d" },
        y: { label: "% change", grid: true },
        marks: [
          Plot.ruleY([0], { stroke: C.muted, strokeOpacity: 0.4, strokeDasharray: "3,3" }),
          Plot.areaY(band("b90"), { x: "x", y1: "lo", y2: "hi", fill: C.c1, fillOpacity: 0.1 }),
          Plot.areaY(band("b80"), { x: "x", y1: "lo", y2: "hi", fill: C.c1, fillOpacity: 0.14 }),
          Plot.areaY(band("b50"), { x: "x", y1: "lo", y2: "hi", fill: C.c1, fillOpacity: 0.22 }),
          Plot.line(hist, { x: "x", y: "median", stroke: C.c1, strokeWidth: 2 }),
          Plot.line(bridge, { x: "x", y: "median", stroke: C.c1, strokeWidth: 2, strokeDasharray: "5,4" }),
          Plot.dot(d, { x: "x", y: "median", r: 2, fill: C.c1, tip: true, title: (p: { x: number; median: number; forecast: boolean }) => `${p.x}: ${p.median}%${p.forecast ? " (proj.)" : ""}` }),
        ],
      });
    },
    waterfall: (w) => {
      let cum = 0;
      const rows = data.growthContributions.map((it) => {
        const start = cum;
        cum += it.value;
        return { label: it.label, lo: Math.min(start, cum), hi: Math.max(start, cum), dir: it.value >= 0 ? "up" : "down", value: it.value };
      });
      rows.push({ label: "Headline", lo: Math.min(0, cum), hi: Math.max(0, cum), dir: "total", value: Number(cum.toFixed(2)) });
      const fill = (d: { dir: string }) => (d.dir === "total" ? C.fg : d.dir === "up" ? "var(--chart-5)" : C.c4);
      return Plot.plot({
        ...base(),
        width: w,
        height: 320,
        marginBottom: 66,
        x: { label: null, domain: rows.map((r) => r.label), tickRotate: -30 },
        y: { label: "pp contribution", grid: true },
        color: { type: "identity" },
        marks: [
          Plot.ruleY([0], { stroke: C.fg, strokeOpacity: 0.4 }),
          Plot.rectY(rows, { x: "label", y1: "lo", y2: "hi", fill, inset: 6, rx: 1, tip: true, title: (d: { label: string; value: number }) => `${d.label}: ${d.value > 0 ? "+" : ""}${d.value}pp` }),
        ],
      });
    },
    slope: (w) => {
      const rows = data.slopeRanks;
      const long = rows.flatMap((r) => [{ item: r.item, t: "2010", v: r.left }, { item: r.item, t: "2025", v: r.right }]);
      return Plot.plot({
        ...base(),
        width: w,
        height: 340,
        marginLeft: 40,
        marginRight: 96,
        x: { label: null, domain: ["2010", "2025"], padding: 0.25 },
        y: { label: "% of world GDP (PPP)", grid: true },
        color: { domain: rows.map((r) => r.item), range: seriesRange },
        marks: [
          Plot.line(long, { x: "t", y: "v", z: "item", stroke: "item", strokeWidth: 2, tip: true }),
          Plot.dot(long, { x: "t", y: "v", z: "item", fill: "item", r: 3.5 }),
          Plot.text(long.filter((d) => d.t === "2025"), { x: "t", y: "v", text: (d: { item: string }) => d.item, textAnchor: "start", dx: 8, fontSize: 10, fill: C.fg }),
        ],
      });
    },
    "connected-scatter": (w) => {
      const d = data.phillipsPath;
      return Plot.plot({
        ...base(),
        width: w,
        height: 320,
        x: { label: "Unemployment (%)", grid: true },
        y: { label: "Inflation (%)", grid: true },
        marks: [
          Plot.line(d, { x: "x", y: "y", stroke: C.c1, strokeWidth: 1.6, curve: "catmull-rom", marker: "arrow" }),
          Plot.dot(d, { x: "x", y: "y", fill: C.c1, r: 3.5, tip: true, title: (p: { year: number; x: number; y: number }) => `${p.year}: u=${p.x}%, π=${p.y}%` }),
          Plot.text(d, { x: "x", y: "y", text: (p: { year: number }) => String(p.year), dy: -9, fontSize: 9, fill: C.muted }),
        ],
      });
    },
    ecdf: (w) => {
      const xs = [...data.growthDistribution].sort((a, b) => a - b);
      const n = xs.length;
      const rows = xs.map((x, i) => ({ x, p: (i + 1) / n }));
      return Plot.plot({
        ...base(),
        width: w,
        height: 300,
        x: { label: "% growth", grid: true },
        y: { label: "Cumulative probability", grid: true, domain: [0, 1] },
        marks: [
          Plot.ruleY([0.5], { stroke: C.muted, strokeOpacity: 0.4, strokeDasharray: "3,3" }),
          Plot.lineY(rows, { x: "x", y: "p", stroke: C.c1, strokeWidth: 2, curve: "step-after" }),
        ],
      });
    },
    lorenz: (w) => {
      const xs = [...data.incomeDistribution].sort((a, b) => a - b);
      const n = xs.length;
      const total = xs.reduce((a, b) => a + b, 0) || 1;
      let cum = 0;
      const rows: Array<{ p: number; l: number }> = [{ p: 0, l: 0 }];
      xs.forEach((v, i) => {
        cum += v;
        rows.push({ p: (i + 1) / n, l: cum / total });
      });
      let area = 0;
      for (let i = 1; i < rows.length; i++) area += (rows[i]!.p - rows[i - 1]!.p) * (rows[i]!.l + rows[i - 1]!.l) / 2;
      const gini = 1 - 2 * area;
      return Plot.plot({
        ...base(),
        width: Math.min(w, 440),
        height: Math.min(w, 440),
        x: { label: "Cumulative share of population", grid: true, domain: [0, 1] },
        y: { label: "Cumulative share of income", grid: true, domain: [0, 1] },
        marks: [
          Plot.areaY(rows, { x: "p", y: "l", fill: C.c1, fillOpacity: 0.12 }),
          Plot.line([{ p: 0, l: 0 }, { p: 1, l: 1 }], { x: "p", y: "l", stroke: C.muted, strokeDasharray: "4,4" }),
          Plot.line(rows, { x: "p", y: "l", stroke: C.c1, strokeWidth: 2 }),
          Plot.text([{ p: 0.62, l: 0.26 }], { x: "p", y: "l", text: [`Gini ≈ ${gini.toFixed(2)}`], fill: C.fg, fontSize: 12, fontWeight: 600 }),
        ],
      });
    },
    hexbin: (w) => {
      const d = data.phillips;
      return Plot.plot({
        ...base(),
        width: w,
        height: 320,
        x: { label: "Unemployment (%)", grid: true },
        y: { label: "Inflation (%)", grid: true },
        color: { type: "linear", range: ["color-mix(in oklab, var(--chart-1) 14%, var(--card))", "var(--chart-1)"], label: "density" },
        marks: [
          Plot.hexgrid({ binWidth: 20, stroke: C.muted, strokeOpacity: 0.15 }),
          Plot.dot(d, Plot.hexbin({ fill: "count" }, { x: "x", y: "y", binWidth: 20, symbol: "hexagon", r: 11, stroke: C.bg, strokeWidth: 0.5, tip: true })),
        ],
      });
    },
    beeswarm: (w) => {
      const groups = data.regionalGrowth;
      const rows = groups.flatMap((g) => g.values.map((v) => ({ group: g.label, v })));
      return Plot.plot({
        ...base(),
        width: w,
        height: 320,
        marginBottom: 40,
        x: { axis: null },
        fx: { label: null, domain: groups.map((g) => g.label) },
        y: { label: "% growth", grid: true },
        color: { domain: groups.map((g) => g.label), range: seriesRange },
        marks: [Plot.dot(rows, Plot.dodgeX("middle", { fx: "group", y: "v", fill: "group", r: 2.7, fillOpacity: 0.8 }))],
      });
    },
    candlestick: (w) => {
      const d = data.ohlc;
      const up = "var(--chart-5)";
      const down = C.c4;
      const color = (k: { o: number; c: number }) => (k.c >= k.o ? up : down);
      return Plot.plot({
        ...base(),
        width: w,
        height: 300,
        x: { label: "session", tickFormat: "d" },
        y: { label: "level", grid: true },
        color: { type: "identity" },
        marks: [
          Plot.ruleX(d, { x: "t", y1: "l", y2: "h", stroke: color }),
          Plot.rect(d, { x1: (k: { t: number }) => k.t - 0.32, x2: (k: { t: number }) => k.t + 0.32, y1: "o", y2: "c", fill: color, tip: true, title: (k: { o: number; h: number; l: number; c: number }) => `O ${k.o}  H ${k.h}  L ${k.l}  C ${k.c}` }),
        ],
      });
    },
    ridgeline: (w) => {
      const groups = data.regionalGrowth;
      const step = 1;
      const overlap = 1.9;
      const lines = groups.map((g) => kdeLine(g.values, 1));
      let gmax = 0;
      lines.forEach((l) => l.forEach((p) => (gmax = Math.max(gmax, p.y))));
      gmax = gmax || 1;
      const rows: Array<{ group: string; x: number; base: number; y: number }> = [];
      const labels: Array<{ label: string; x: number; y: number }> = [];
      const xmin = Math.min(...groups.flatMap((g) => g.values));
      groups.forEach((g, gi) => {
        const baseY = (groups.length - 1 - gi) * step;
        labels.push({ label: g.label, x: xmin, y: baseY });
        lines[gi]!.forEach((p) => rows.push({ group: g.label, x: p.x, base: baseY, y: baseY + (p.y / gmax) * step * overlap }));
      });
      return Plot.plot({
        ...base(),
        width: w,
        height: 58 * groups.length + 50,
        marginLeft: 88,
        x: { label: "% growth", grid: true },
        y: { axis: null, domain: [-0.3, (groups.length - 1) * step + step * overlap + 0.4] },
        color: { domain: groups.map((g) => g.label), range: seriesRange },
        marks: [
          Plot.areaY(rows, { x: "x", y1: "base", y2: "y", fill: "group", fillOpacity: 0.72, curve: "basis", stroke: C.bg, strokeWidth: 0.5 }),
          Plot.text(labels, { x: "x", y: "y", text: "label", textAnchor: "end", dx: -8, dy: -3, fill: C.muted, fontSize: 10 }),
        ],
      });
    },
    violin: (w) => {
      const groups = data.regionalGrowth;
      const width = w;
      const height = 320;
      const padL = 44;
      const padR = 14;
      const padT = 16;
      const padB = 38;
      const all = groups.flatMap((g) => g.values);
      const ymin = Math.min(...all);
      const ymax = Math.max(...all);
      const span = ymax - ymin || 1;
      const plotH = height - padT - padB;
      const yPix = (v: number) => padT + plotH * (1 - (v - ymin) / span);
      const bandW = (width - padL - padR) / groups.length;
      const half = bandW * 0.4;
      const svg = svgRoot(width, height);
      // y grid + axis labels
      for (let t = 0; t <= 4; t++) {
        const v = ymin + (span * t) / 4;
        const y = yPix(v);
        svg.appendChild(el("line", { x1: padL, x2: width - padR, y1: y, y2: y, stroke: "var(--border)", "stroke-opacity": 0.7 }));
        svg.appendChild(el("text", { x: padL - 6, y: y + 3, "text-anchor": "end", "font-size": 10, fill: C.muted }, v.toFixed(1)));
      }
      groups.forEach((g, gi) => {
        const cx = padL + bandW * (gi + 0.5);
        const f = kdeFn(g.values);
        const sorted = [...g.values].sort((a, b) => a - b);
        const samples = 48;
        let dmax = 0;
        const dens: Array<{ v: number; d: number }> = [];
        for (let i = 0; i <= samples; i++) {
          const v = sorted[0]! + ((sorted[sorted.length - 1]! - sorted[0]!) * i) / samples;
          const den = f(v);
          dmax = Math.max(dmax, den);
          dens.push({ v, d: den });
        }
        dmax = dmax || 1;
        const left = dens.map((p) => `${cx - (p.d / dmax) * half},${yPix(p.v)}`);
        const right = dens.slice().reverse().map((p) => `${cx + (p.d / dmax) * half},${yPix(p.v)}`);
        svg.appendChild(el("path", { d: `M${left.join("L")}L${right.join("L")}Z`, fill: seriesRange[gi % seriesRange.length]!, "fill-opacity": 0.55, stroke: seriesRange[gi % seriesRange.length]!, "stroke-width": 1 }));
        // median + quartile box
        const q = (p: number) => quant(sorted, p);
        svg.appendChild(el("line", { x1: cx, x2: cx, y1: yPix(q(0.05)), y2: yPix(q(0.95)), stroke: C.fg, "stroke-opacity": 0.6 }));
        svg.appendChild(el("rect", { x: cx - 3, y: yPix(q(0.75)), width: 6, height: Math.max(1, yPix(q(0.25)) - yPix(q(0.75))), fill: C.fg, "fill-opacity": 0.75, rx: 1 }));
        svg.appendChild(el("circle", { cx, cy: yPix(q(0.5)), r: 2.4, fill: C.bg }));
        svg.appendChild(el("text", { x: cx, y: height - 14, "text-anchor": "middle", "font-size": 10, fill: C.muted }, g.label));
      });
      return svg;
    },
    radar: (w) => {
      const { axes, series } = data.radarProfiles;
      const size = Math.min(w, 400);
      const legendW = 132;
      const cx = size / 2;
      const cy = size / 2 + 6;
      const R = size / 2 - 46;
      const n = axes.length;
      const ang = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
      const at = (i: number, r: number) => [cx + Math.cos(ang(i)) * r, cy + Math.sin(ang(i)) * r] as const;
      const svg = svgRoot(size + legendW, size + 12);
      // concentric rings
      [0.25, 0.5, 0.75, 1].forEach((f) => {
        const pts = axes.map((_, i) => at(i, R * f).join(",")).join(" ");
        svg.appendChild(el("polygon", { points: pts, fill: "none", stroke: "var(--border)", "stroke-opacity": 0.8 }));
      });
      axes.forEach((label, i) => {
        const [x, y] = at(i, R);
        svg.appendChild(el("line", { x1: cx, y1: cy, x2: x, y2: y, stroke: "var(--border)" }));
        const [lx, ly] = at(i, R + 16);
        const anchor = Math.abs(lx - cx) < 4 ? "middle" : lx > cx ? "start" : "end";
        svg.appendChild(el("text", { x: lx, y: ly + 3, "text-anchor": anchor, "font-size": 10, fill: C.muted }, label));
      });
      series.forEach((s, si) => {
        const color = seriesRange[si % seriesRange.length]!;
        const pts = s.values.map((v, i) => at(i, (R * Math.max(0, Math.min(100, v))) / 100).join(",")).join(" ");
        svg.appendChild(el("polygon", { points: pts, fill: color, "fill-opacity": 0.18, stroke: color, "stroke-width": 2 }));
        s.values.forEach((v, i) => {
          const [x, y] = at(i, (R * v) / 100);
          svg.appendChild(el("circle", { cx: x, cy: y, r: 2.6, fill: color }));
        });
        // legend
        const ly = 18 + si * 18;
        svg.appendChild(el("rect", { x: size + 10, y: ly, width: 10, height: 10, rx: 2, fill: color }));
        svg.appendChild(el("text", { x: size + 26, y: ly + 9, "font-size": 11, fill: C.muted }, s.name));
      });
      return svg;
    },
    donut: (w) => {
      const size = Math.min(w, 300);
      const r = size / 2;
      const inner = r * 0.62;
      const pie = d3.pie().value((d: { value: number }) => d.value).sort(null);
      const arc = d3.arc().innerRadius(inner).outerRadius(r - 4).padAngle(0.012).cornerRadius(2);
      const parts = data.donutParts;
      const legendW = 120;
      const svg = document.createElementNS(NS, "svg");
      svg.setAttribute("viewBox", `0 0 ${size + legendW} ${size}`);
      svg.setAttribute("class", "plot");
      const g = document.createElementNS(NS, "g");
      g.setAttribute("transform", `translate(${r},${r})`);
      pie(parts).forEach((s: { startAngle: number; endAngle: number }, i: number) => {
        const path = document.createElementNS(NS, "path");
        path.setAttribute("d", arc(s) as string);
        path.setAttribute("fill", seriesRange[i % seriesRange.length]!);
        g.appendChild(path);
      });
      const total = parts.reduce((a, b) => a + b.value, 0);
      const mk = (text: string, dy: string, fill: string, fs: number, weight = "400") => {
        const t = document.createElementNS(NS, "text");
        t.setAttribute("text-anchor", "middle");
        t.setAttribute("dy", dy);
        t.setAttribute("fill", fill);
        t.setAttribute("font-size", String(fs));
        t.setAttribute("font-weight", weight);
        t.textContent = text;
        return t;
      };
      g.appendChild(mk(`${total}%`, "-0.05em", "var(--foreground)", 20, "650"));
      g.appendChild(mk("reserves", "1.3em", "var(--muted-foreground)", 11));
      svg.appendChild(g);
      const leg = document.createElementNS(NS, "g");
      leg.setAttribute("transform", `translate(${size + 8},${size / 2 - parts.length * 9})`);
      parts.forEach((p, i) => {
        const y = i * 18;
        const rect = document.createElementNS(NS, "rect");
        rect.setAttribute("x", "0");
        rect.setAttribute("y", String(y));
        rect.setAttribute("width", "10");
        rect.setAttribute("height", "10");
        rect.setAttribute("rx", "2");
        rect.setAttribute("fill", seriesRange[i % seriesRange.length]!);
        const lbl = document.createElementNS(NS, "text");
        lbl.setAttribute("x", "16");
        lbl.setAttribute("y", String(y + 9));
        lbl.setAttribute("fill", "var(--muted-foreground)");
        lbl.setAttribute("font-size", "11");
        lbl.textContent = `${p.label} ${p.value}%`;
        leg.appendChild(rect);
        leg.appendChild(lbl);
      });
      svg.appendChild(leg);
      return svg;
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
