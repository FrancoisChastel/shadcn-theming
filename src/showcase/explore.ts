/**
 * Render the component explorer as a small multi-page site (Home, Foundations,
 * Components, Layouts & pages, Charts, AI harness) sharing a top nav and theme.
 * Each page is self-contained: theme tokens, CSS, HTML, and the inlined
 * vanilla-JS runtime. Observable Plot (for charts) is inlined only on pages that
 * actually contain charts, so text-only pages stay small.
 */
import type { Brand } from "../core/brand-schema.js";
import { renderRootBlock, renderDarkBlock } from "../core/render.js";
import type { ThemeTokens } from "../core/tokens.js";
import { EXPLORE_CSS } from "./styles.js";
import { buildSections, type Section } from "./sections.js";
import { chartMain, type ShowcaseData } from "./runtime-charts.js";
import { uiMain } from "./runtime-ui.js";
import { renderPlotScripts } from "./plot-asset.js";
import { icon } from "./icons.js";
import {
  gdpProjection,
  growthDistribution,
  phillips,
  regionalGrowth,
  macroLabels,
  macroColumns,
  regionSeries,
  groupedBars,
  divergingCA,
  donutParts,
  bulletKpis,
  weoFan,
  growthContributions,
  slopeRanks,
  phillipsPath,
  radarProfiles,
  incomeDistribution,
  ohlc,
} from "./data.js";

function esc(s: string): string {
  return s.replace(/[&<>]/g, (c) => (c === "&" ? "&amp;" : c === "<" ? "&lt;" : "&gt;"));
}

interface PageDef {
  file: string;
  label: string;
  title: string;
  subtitle: string;
  groups: string[];
}

/** The pages of the site and which section-groups belong to each. */
const PAGES: PageDef[] = [
  { file: "index.html", label: "Design system", title: "design system", subtitle: "The theme, palette, typography, and headline indicators — the foundations everything is built from.", groups: ["Overview", "Foundations"] },
  { file: "components.html", label: "Components", title: "components", subtitle: "Every shadcn/ui component, live and interactive, in the brand theme.", groups: ["Forms", "Data display", "Communication", "Overlays & menus", "Navigation", "Security & classification"] },
  { file: "layouts.html", label: "Layouts & pages", title: "layouts & pages", subtitle: "App-shell navigation (headers, sidebars, footers) plus layout primitives and ready-made page blocks (auth, errors, empty states).", groups: ["App shell", "Layout", "Blocks"] },
  { file: "templates.html", label: "Templates", title: "page templates", subtitle: "Composite IMF page templates — data explorer, country profile, publication reader.", groups: ["Templates"] },
  { file: "charts.html", label: "Charts", title: "charts", subtitle: "Scientific and business charts built on Observable Plot, plus KPI extensions.", groups: ["Extensions", "Scientific charts"] },
  { file: "ai.html", label: "AI harness", title: "AI harness", subtitle: "A Claude Code / Pi-style AI experience: streaming, tools, code, diffs, and a plan.", groups: ["AI harness"] },
  { file: "develop.html", label: "Develop", title: "develop & contribute", subtitle: "Install and use the design system across VS Code, Claude Code, and Pi — with a downloadable Agent Skill, AGENTS.md, and the contribution workflow.", groups: ["Develop"] },
];

/** Top-of-page navigation between site pages. */
function renderTopNav(activeFile: string): string {
  return `<nav class="pagenav">${PAGES.map(
    (p) => `<a href="${p.file}"${p.file === activeFile ? ' class="active"' : ""}>${esc(p.label)}</a>`,
  ).join("")}</nav>`;
}

/** Sidebar grouped nav from a page's section list. */
function renderSidebarNav(sections: Section[]): string {
  const groups = new Map<string, Section[]>();
  for (const s of sections) {
    if (!groups.has(s.group)) groups.set(s.group, []);
    groups.get(s.group)!.push(s);
  }
  return [...groups.entries()]
    .map(
      ([group, items]) =>
        `<div class="nav-group">${esc(group)}</div><div class="nav">${items
          .map((s) => `<a href="#${s.id}" data-nav-link>${esc(s.title)}</a>`)
          .join("")}</div>`,
    )
    .join("");
}

function renderSection(s: Section): string {
  return `<section class="block" id="${s.id}">
    <h2>${esc(s.title)}</h2>
    <p class="desc">${esc(s.desc)}</p>
    ${s.html}
  </section>`;
}

/** Global overlays referenced by [data-open] triggers + the command palette. */
function overlays(): string {
  return `
  <div class="overlay" id="dlg-edit"><div class="backdrop" data-close></div>
    <div class="dialog"><div class="dh"><h3>Edit forecast</h3></div>
      <div class="db">Adjust the projected growth path. Changes apply to the working scenario only.</div>
      <div style="padding:0 1.25rem"><label class="label">2025 growth (%)</label><input class="input" value="3.1" /></div>
      <div class="df"><button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" data-close>Save changes</button></div>
    </div></div>

  <div class="overlay" id="dlg-del"><div class="backdrop" data-close></div>
    <div class="dialog"><div class="dh"><h3>Delete this series?</h3></div>
      <div class="db">This action cannot be undone. The series and its projections will be permanently removed.</div>
      <div class="df"><button class="btn btn-outline" data-close>Cancel</button><button class="btn btn-destructive" data-close>Delete</button></div>
    </div></div>

  <div class="overlay" id="sheet-1"><div class="backdrop" data-close></div>
    <div class="sheet"><div style="display:flex;justify-content:space-between;align-items:start"><div><h3 style="margin:0">Filters</h3><p class="muted" style="font-size:.83rem;margin:.3rem 0 0">Refine the dataset</p></div><button class="btn btn-ghost btn-icon" data-close aria-label="Close">${icon("x", { size: 16 })}</button></div>
      <div style="margin-top:1.25rem;display:flex;flex-direction:column;gap:1rem">
        <div class="field"><label class="label">Indicator</label><input class="input" value="Real GDP growth" /></div>
        <label class="check"><input type="checkbox" checked /> Include projections</label>
        <label class="check"><input type="checkbox" /> Seasonally adjusted</label>
      </div>
      <div style="margin-top:1.5rem;display:flex;gap:.5rem"><button class="btn btn-outline" data-close style="flex:1">Reset</button><button class="btn btn-primary" data-close style="flex:1">Apply</button></div>
    </div></div>

  <div class="overlay" id="drawer-1"><div class="backdrop" data-close></div>
    <div class="drawer"><div class="grab"></div><h3 style="margin:0 0 .3rem">Quick note</h3><p class="muted" style="font-size:.85rem;margin:0 0 1rem">Attach a comment to this data point.</p>
      <textarea class="textarea" placeholder="Type a note…"></textarea>
      <div style="margin-top:1rem;display:flex;justify-content:flex-end;gap:.5rem"><button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" data-close>Save</button></div>
    </div></div>

  <div id="cmdk"><div class="cmd">
    <input data-cmd-input placeholder="Type a command or search…" />
    <div class="list">
      <div class="menu-label">Pages</div>
      ${PAGES.map((p) => `<div data-cmd-item onclick="location.href='${p.file}'">${esc(p.label)}</div>`).join("")}
    </div>
  </div></div>`;
}

interface ShellOptions {
  brand: Brand;
  rootBlock: string;
  darkBlock: string;
  initial: string;
  sections: Section[];
  data: ShowcaseData;
  activeFile: string;
  title: string;
  subtitle: string;
  showTopNav: boolean;
}

/** Render one full HTML page. */
function pageShell(o: ShellOptions): string {
  const needsCharts = o.sections.some((s) => s.html.includes("data-chart") || s.html.includes("data-spark"));
  const runtime = `(${uiMain.toString()})();` + (needsCharts ? `\n(${chartMain.toString()})(${JSON.stringify(o.data)});` : "");
  const plotScripts = needsCharts ? renderPlotScripts() : "";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(o.brand.name)} — ${esc(o.title)}</title>
<style>
${o.rootBlock}
${o.darkBlock}
${EXPLORE_CSS}
</style>
</head>
<body>
<a href="#main" class="skip-link">Skip to content</a>
<div class="app">
  <aside class="side" aria-label="Sections">
    <div class="brand"><span class="mark" aria-hidden="true">${esc(o.initial)}</span><div><b>${esc(o.brand.name)}</b><span>design system</span></div></div>
    ${renderSidebarNav(o.sections)}
  </aside>
  <main class="main" id="main">
    <div class="topbar">
      ${o.showTopNav ? renderTopNav(o.activeFile) : ""}
      <button type="button" class="search" aria-label="Search — open command palette" aria-keyshortcuts="Meta+K Control+K" onclick="document.getElementById('cmdk').classList.add('open');setTimeout(()=>document.querySelector('[data-cmd-input]').focus(),20)">
        ${icon("search", { size: 15 })} Search… <kbd>⌘K</kbd>
      </button>
      <button class="btn btn-outline btn-sm" data-toggle-theme>Toggle theme</button>
    </div>
    <div class="content">
      <div class="hero">
        <h1>${esc(o.brand.name)} ${esc(o.title)}</h1>
        <p>${esc(o.subtitle)}</p>
      </div>
      ${o.sections.map(renderSection).join("\n")}
      <footer class="muted" style="font-size:.75rem;border-top:1px solid var(--border);padding-top:1.25rem;margin-top:3rem">Generated by shadcn-theming · synthetic, illustrative data</footer>
    </div>
  </main>
</div>
${overlays()}
${plotScripts}
<script>${runtime}</script>
</body>
</html>
`;
}

function buildData(): ShowcaseData {
  return {
    gdpProjection,
    growthDistribution,
    phillips,
    regionalGrowth,
    macroLabels,
    macroColumns,
    regionSeries,
    groupedBars,
    divergingCA,
    donutParts,
    bulletKpis,
    weoFan,
    growthContributions,
    slopeRanks,
    phillipsPath,
    radarProfiles,
    incomeDistribution,
    ohlc,
  };
}

/**
 * Render the explorer as a multi-page site: `{ "index.html": html, … }`.
 */
export function renderExploreSite(brand: Brand, tokens: ThemeTokens): Record<string, string> {
  const light = tokens.light ?? tokens.dark!;
  const rootBlock = renderRootBlock(tokens, light);
  const darkBlock = tokens.dark && tokens.light ? renderDarkBlock(tokens.dark) : "";
  const initial = brand.name.trim().charAt(0).toUpperCase() || "•";
  const all = buildSections(light, brand.name);
  const data = buildData();

  const site: Record<string, string> = {};
  for (const page of PAGES) {
    const sections = all.filter((s) => page.groups.includes(s.group));
    if (sections.length === 0) continue;
    site[page.file] = pageShell({
      brand,
      rootBlock,
      darkBlock,
      initial,
      sections,
      data,
      activeFile: page.file,
      title: page.title,
      subtitle: page.subtitle,
      showTopNav: true,
    });
  }
  return site;
}

/**
 * Render a single combined page with every section (no cross-page nav).
 */
export function renderExploreHtml(brand: Brand, tokens: ThemeTokens): string {
  const light = tokens.light ?? tokens.dark!;
  const rootBlock = renderRootBlock(tokens, light);
  const darkBlock = tokens.dark && tokens.light ? renderDarkBlock(tokens.dark) : "";
  const initial = brand.name.trim().charAt(0).toUpperCase() || "•";
  return pageShell({
    brand,
    rootBlock,
    darkBlock,
    initial,
    sections: buildSections(light, brand.name),
    data: buildData(),
    activeFile: "",
    title: "component explorer",
    subtitle: `Every shadcn/ui component, live and interactive, in the ${brand.name} theme.`,
    showTopNav: false,
  });
}
