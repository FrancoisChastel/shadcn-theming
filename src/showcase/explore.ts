/**
 * Render the component explorer — a shadcn-website-style page that shows every
 * component, live and interactive, in the brand's theme. Self-contained: theme
 * tokens, CSS, HTML, and the inlined vanilla-JS runtime (charts + interactivity)
 * all ship in one file with zero dependencies.
 */
import type { Brand } from "../core/brand-schema.js";
import { renderRootBlock, renderDarkBlock } from "../core/render.js";
import type { ThemeTokens } from "../core/tokens.js";
import { EXPLORE_CSS } from "./styles.js";
import { buildSections, type Section } from "./sections.js";
import { chartMain, type ShowcaseData } from "./runtime-charts.js";
import { uiMain } from "./runtime-ui.js";
import { renderPlotScripts } from "./plot-asset.js";
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
} from "./data.js";

function esc(s: string): string {
  return s.replace(/[&<>]/g, (c) => (c === "&" ? "&amp;" : c === "<" ? "&lt;" : "&gt;"));
}

/** Sidebar grouped nav from the section list. */
function renderNav(sections: Section[]): string {
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
    <div class="sheet"><div style="display:flex;justify-content:space-between;align-items:start"><div><h3 style="margin:0">Filters</h3><p class="muted" style="font-size:.83rem;margin:.3rem 0 0">Refine the dataset</p></div><button class="btn btn-ghost btn-icon" data-close>✕</button></div>
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
      <div class="menu-label">Suggestions</div>
      <div data-cmd-item>📈 Open World Economic Outlook</div>
      <div data-cmd-item>🗺 Open DataMapper</div>
      <div data-cmd-item>➕ New projection</div>
      <div data-cmd-item>📤 Export current view</div>
      <div class="menu-label">Navigation</div>
      <div data-cmd-item>Go to Buttons</div>
      <div data-cmd-item>Go to Scientific charts</div>
      <div data-cmd-item>Go to Overlays</div>
    </div>
  </div></div>`;
}

/** Render the full explorer document. */
export function renderExploreHtml(brand: Brand, tokens: ThemeTokens): string {
  const light = tokens.light ?? tokens.dark!;
  const rootBlock = renderRootBlock(tokens, light);
  const darkBlock = tokens.dark && tokens.light ? renderDarkBlock(tokens.dark) : "";
  const sections = buildSections(light, brand.name);
  const initial = brand.name.trim().charAt(0).toUpperCase() || "•";

  const data: ShowcaseData = {
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
  };

  const runtime = `
    (${chartMain.toString()})(${JSON.stringify(data)});
    (${uiMain.toString()})();
  `;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(brand.name)} — component explorer</title>
<style>
${rootBlock}
${darkBlock}
${EXPLORE_CSS}
</style>
</head>
<body>
<div class="app">
  <aside class="side">
    <div class="brand"><span class="mark">${esc(initial)}</span><div><b>${esc(brand.name)}</b><span>component explorer</span></div></div>
    ${renderNav(sections)}
  </aside>
  <main class="main">
    <div class="topbar">
      <div class="search" onclick="document.getElementById('cmdk').classList.add('open');setTimeout(()=>document.querySelector('[data-cmd-input]').focus(),20)">
        <span>🔍</span> Search components… <kbd>⌘K</kbd>
      </div>
      <button class="btn btn-outline btn-sm" data-toggle-theme>Toggle theme</button>
    </div>
    <div class="content">
      <div class="hero">
        <h1>${esc(brand.name)} design system</h1>
        <p>Every shadcn/ui component, live and interactive, in the ${esc(brand.name)} theme — plus registry extensions and native scientific charts. Try the controls, open the dialogs, press <kbd style="border:1px solid var(--border);border-radius:4px;padding:0 .3rem;background:var(--muted)">⌘K</kbd>.</p>
      </div>
      ${sections.map(renderSection).join("\n")}
      <footer class="muted" style="font-size:.75rem;border-top:1px solid var(--border);padding-top:1.25rem;margin-top:3rem">Generated by shadcn-theming · synthetic, illustrative data</footer>
    </div>
  </main>
</div>
${overlays()}
${renderPlotScripts()}
<script>${runtime}</script>
</body>
</html>
`;
}
