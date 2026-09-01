/**
 * Render a comprehensive, self-contained HTML showcase for a theme: the core
 * shadcn component set, the extension KPI cards, and every scientific chart —
 * all driven by the injected theme tokens, in light + dark. Zero dependencies,
 * so it's shareable and screenshot-friendly.
 */
import type { Brand } from "../core/brand-schema.js";
import { renderRootBlock, renderDarkBlock } from "../core/render.js";
import type { ThemeTokens, TokenMap } from "../core/tokens.js";
import { COLOR_TOKENS } from "../core/tokens.js";
import { chartMain, type ShowcaseData } from "./runtime-charts.js";
import { renderPlotScripts } from "./plot-asset.js";
import {
  gdpProjection,
  growthDistribution,
  phillips,
  regionalGrowth,
  macroLabels,
  macroColumns,
  kpis,
  type Kpi,
} from "./data.js";

function esc(s: string): string {
  return s.replace(/[&<>]/g, (c) => (c === "&" ? "&amp;" : c === "<" ? "&lt;" : "&gt;"));
}

function statCard(k: Kpi): string {
  const trend = k.delta > 0 ? "up" : k.delta < 0 ? "down" : "flat";
  const arrow = trend === "up" ? "▲" : trend === "down" ? "▼" : "→";
  return `<div class="card kpi">
    <div class="kpi-top"><span class="muted">${esc(k.label)}</span></div>
    <div class="kpi-mid">
      <div class="kpi-value">${esc(k.value)}</div>
      <span class="spark" data-spark='${JSON.stringify(k.data)}' data-trend="${trend}"></span>
    </div>
    <div class="kpi-delta ${trend}"><span class="pill">${arrow} ${Math.abs(k.delta)}%</span><span class="muted">${esc(k.deltaLabel)}</span></div>
  </div>`;
}

function swatchStrip(map: TokenMap): string {
  const keys = COLOR_TOKENS.filter((k) => !k.endsWith("-foreground") && !k.startsWith("sidebar"));
  return keys
    .map((k) => `<div class="sw"><span class="chip" style="background:var(--${k})"></span><code>${k}</code></div>`)
    .join("");
}

const COMPONENTS_HTML = `
<div class="stack">
  <h3>Buttons</h3>
  <div class="row">
    <button class="btn btn-primary">Primary</button>
    <button class="btn btn-secondary">Secondary</button>
    <button class="btn btn-outline">Outline</button>
    <button class="btn btn-ghost">Ghost</button>
    <button class="btn btn-destructive">Delete</button>
  </div>
</div>
<div class="stack">
  <h3>Inputs & selection</h3>
  <div class="row">
    <input class="input" placeholder="Search indicators…" />
    <label class="switch"><input type="checkbox" checked /><span class="track"><span class="thumb"></span></span> Projections</label>
  </div>
  <div class="row" style="margin-top:.75rem">
    <span class="badge badge-primary">Advanced</span>
    <span class="badge badge-secondary">Emerging</span>
    <span class="badge badge-outline">Low-income</span>
    <div class="progress"><span style="width:64%"></span></div>
  </div>
</div>
<div class="stack">
  <h3>Alert</h3>
  <div class="alert alert-destructive"><strong>Downside risk.</strong> Financial conditions have tightened.</div>
</div>
`;

function tableHtml(): string {
  const rows = [
    ["Advanced economies", "1.8", "2.0", "26.3"],
    ["Emerging markets", "4.2", "3.9", "48.1"],
    ["Low-income countries", "5.0", "4.7", "8.4"],
    ["World", "3.2", "3.1", "100.0"],
  ];
  return `<div class="card"><div class="card-pad">
    <div class="card-title">Real GDP growth by group</div>
    <table class="tbl"><thead><tr><th>Group</th><th>2024</th><th>2025F</th><th>Weight</th></tr></thead>
    <tbody>${rows
      .map(
        (r) =>
          `<tr><td>${r[0]}</td><td class="num">${r[1]}</td><td class="num">${r[2]}</td><td class="num">${r[3]}</td></tr>`,
      )
      .join("")}</tbody></table>
  </div></div>`;
}

const STATIC_CSS = `
* { box-sizing: border-box; }
body { margin: 0; font-family: var(--font-sans, ui-sans-serif, system-ui, sans-serif); background: var(--background); color: var(--foreground); }
.wrap { max-width: 1160px; margin: 0 auto; padding: 2.5rem 1.5rem 6rem; }
a { color: inherit; }
header.top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2.5rem; padding-bottom: 1.25rem; border-bottom: 1px solid var(--border); }
.brand { display: flex; align-items: center; gap: 0.85rem; }
.brand .mark { width: 2.4rem; height: 2.4rem; border-radius: var(--radius); background: var(--primary); display: grid; place-items: center; color: var(--primary-foreground); font-weight: 700; }
.brand h1 { font-size: 1.15rem; margin: 0; letter-spacing: -0.01em; }
.brand p { margin: 0; color: var(--muted-foreground); font-size: 0.8125rem; }
.toggle { border: 1px solid var(--border); background: var(--card); color: var(--card-foreground); border-radius: var(--radius); padding: 0.5rem 0.9rem; cursor: pointer; font-size: 0.8125rem; }
section { margin-bottom: 3rem; }
.eyebrow { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.12em; color: var(--muted-foreground); margin: 0 0 1rem; font-weight: 600; }
.palette { display: flex; flex-wrap: wrap; gap: 0.4rem 1rem; margin-bottom: 1rem; }
.sw { display: flex; align-items: center; gap: 0.45rem; font-size: 0.72rem; }
.sw .chip { width: 1.15rem; height: 1.15rem; border-radius: 4px; border: 1px solid var(--border); }
.sw code { color: var(--muted-foreground); }
.cols2 { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 1.5rem; align-items: start; }
.kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
.charts { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
.charts .wide { grid-column: 1 / -1; }
@media (max-width: 860px) { .cols2, .kpis, .charts { grid-template-columns: 1fr; } }
.stack { margin-bottom: 1.5rem; }
.stack h3 { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted-foreground); margin: 0 0 0.7rem; }
.row { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }
.btn { border-radius: var(--radius); padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500; border: 1px solid transparent; cursor: pointer; }
.btn:hover { opacity: 0.9; }
.btn-primary { background: var(--primary); color: var(--primary-foreground); }
.btn-secondary { background: var(--secondary); color: var(--secondary-foreground); }
.btn-outline { background: transparent; color: var(--foreground); border-color: var(--border); }
.btn-ghost { background: transparent; color: var(--foreground); }
.btn-ghost:hover { background: var(--accent); color: var(--accent-foreground); opacity: 1; }
.btn-destructive { background: var(--destructive); color: var(--destructive-foreground); }
.input { padding: 0.5rem 0.75rem; border-radius: var(--radius); border: 1px solid var(--input); background: var(--background); color: var(--foreground); font-size: 0.875rem; min-width: 220px; }
.input:focus { outline: 2px solid var(--ring); outline-offset: 1px; }
.switch { display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; cursor: pointer; }
.switch input { display: none; }
.switch .track { width: 2.25rem; height: 1.25rem; background: var(--muted); border-radius: 999px; position: relative; transition: background 150ms; }
.switch .thumb { position: absolute; top: 2px; left: 2px; width: 1rem; height: 1rem; border-radius: 999px; background: var(--background); transition: transform 150ms; }
.switch input:checked + .track { background: var(--primary); }
.switch input:checked + .track .thumb { transform: translateX(1rem); }
.badge { font-size: 0.6875rem; padding: 0.15rem 0.55rem; border-radius: 999px; font-weight: 500; }
.badge-primary { background: var(--primary); color: var(--primary-foreground); }
.badge-secondary { background: var(--secondary); color: var(--secondary-foreground); }
.badge-outline { border: 1px solid var(--border); color: var(--foreground); }
.progress { flex: 1; min-width: 120px; height: 0.5rem; background: var(--muted); border-radius: 999px; overflow: hidden; }
.progress span { display: block; height: 100%; background: var(--primary); }
.alert { border-radius: var(--radius); padding: 0.85rem 1rem; font-size: 0.875rem; border: 1px solid var(--destructive); color: var(--destructive); }
.card { background: var(--card); color: var(--card-foreground); border: 1px solid var(--border); border-radius: var(--radius); }
.card-pad { padding: 1.1rem 1.25rem; }
.card-title { font-weight: 600; font-size: 0.9rem; margin-bottom: 0.75rem; }
.kpi { padding: 1.1rem 1.2rem; display: flex; flex-direction: column; gap: 0.55rem; }
.kpi-top { font-size: 0.8rem; }
.kpi-mid { display: flex; align-items: flex-end; justify-content: space-between; gap: 0.75rem; }
.kpi-value { font-size: 1.6rem; font-weight: 650; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.spark { width: 96px; height: 30px; }
.kpi-delta { display: flex; align-items: center; gap: 0.5rem; font-size: 0.72rem; }
.kpi-delta .pill { padding: 0.1rem 0.45rem; border-radius: 999px; font-weight: 600; }
.kpi-delta.up .pill { background: color-mix(in oklab, var(--chart-1) 15%, var(--card)); color: var(--chart-1); }
.kpi-delta.down .pill { background: color-mix(in oklab, var(--destructive) 15%, var(--card)); color: var(--destructive); }
.kpi-delta.flat .pill { background: var(--muted); color: var(--muted-foreground); }
.muted { color: var(--muted-foreground); }
.plot { width: 100%; height: auto; display: block; }
.plot-card { padding: 1rem 1.1rem 0.9rem; overflow: hidden; }
.plot-title { font-size: 13px; font-weight: 500; color: var(--foreground); margin: 0 0 0.5rem; }
.plot-card figure { margin: 0; }
.plot-card svg { max-width: 100%; height: auto; overflow: visible; }
.spark svg { width: 96px; height: 30px; }
.tbl { width: 100%; border-collapse: collapse; font-size: 0.8125rem; }
.tbl th { text-align: left; color: var(--muted-foreground); font-weight: 500; padding: 0.4rem 0.5rem; border-bottom: 1px solid var(--border); }
.tbl td { padding: 0.45rem 0.5rem; border-bottom: 1px solid var(--border); }
.tbl td.num, .tbl th:not(:first-child) { text-align: right; font-variant-numeric: tabular-nums; }
.tbl tr:last-child td { border-bottom: none; font-weight: 600; }
`;

/** Render the full showcase HTML document. */
export function renderShowcaseHtml(brand: Brand, tokens: ThemeTokens): string {
  const light = tokens.light ?? tokens.dark!;
  const rootBlock = renderRootBlock(tokens, light);
  const darkBlock = tokens.dark && tokens.light ? renderDarkBlock(tokens.dark) : "";
  const initial = brand.name.trim().charAt(0).toUpperCase() || "•";

  const data: ShowcaseData = {
    gdpProjection,
    growthDistribution,
    phillips,
    regionalGrowth,
    macroLabels,
    macroColumns,
  };
  const runtime = `(${chartMain.toString()})(${JSON.stringify(data)});`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(brand.name)} — shadcn showcase</title>
<style>
${rootBlock}
${darkBlock}
${STATIC_CSS}
</style>
</head>
<body>
<div class="wrap">
  <header class="top">
    <div class="brand">
      <span class="mark">${esc(initial)}</span>
      <div>
        <h1>${esc(brand.name)} — design system</h1>
        <p>shadcn/ui theme · scientific charts · ${esc(String(tokens.radius))} radius</p>
      </div>
    </div>
    <button class="toggle" onclick="document.documentElement.classList.toggle('dark')">Toggle theme</button>
  </header>

  <section>
    <p class="eyebrow">Palette</p>
    <div class="palette">${swatchStrip(light)}</div>
  </section>

  <section>
    <p class="eyebrow">Headline indicators</p>
    <div class="kpis">${kpis.map(statCard).join("")}</div>
  </section>

  <section>
    <p class="eyebrow">Components</p>
    <div class="cols2">
      <div>${COMPONENTS_HTML}</div>
      ${tableHtml()}
    </div>
  </section>

  <section>
    <p class="eyebrow">Scientific charts</p>
    <div class="charts">
      <div class="card plot-card wide" data-chart="areaband" data-title="World GDP growth — WEO projection"></div>
      <div class="card plot-card" data-chart="histogram" data-title="Distribution of country growth"></div>
      <div class="card plot-card" data-chart="scatter" data-title="Phillips curve"></div>
      <div class="card plot-card" data-chart="boxplot" data-title="Growth dispersion by group"></div>
      <div class="card plot-card" data-chart="heatmap" data-title="Macro indicator correlations"></div>
    </div>
  </section>

  <footer class="muted" style="font-size:0.75rem;border-top:1px solid var(--border);padding-top:1.25rem">
    Generated by shadcn-theming · synthetic, illustrative data
  </footer>
</div>
${renderPlotScripts()}
<script>${runtime}</script>
</body>
</html>
`;
}
