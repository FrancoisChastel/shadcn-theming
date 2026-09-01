/**
 * HTML builders for every component in the explorer, grouped for the sidebar.
 * Each returns a `Section` with a demo that is interactive via the inlined
 * runtime (see runtime-ui.ts). All markup is token-driven (see styles.ts).
 */
import { COLOR_TOKENS, type TokenMap } from "../core/tokens.js";
import { kpis, type Kpi } from "./data.js";

export interface Section {
  id: string;
  group: string;
  title: string;
  desc: string;
  html: string;
}

const demo = (inner: string, cls = "") => `<div class="demo ${cls}">${inner}</div>`;
const chev = '<svg class="chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>';

function kpiCard(k: Kpi): string {
  const trend = k.delta > 0 ? "up" : "down";
  const arrow = k.delta > 0 ? "▲" : "▼";
  return `<div class="card kpi">
    <span class="muted" style="font-size:.8rem">${k.label}</span>
    <div class="kpi-mid"><div class="kpi-value">${k.value}</div>
      <span class="spark" data-spark='${JSON.stringify(k.data)}' data-trend="${trend}"></span></div>
    <div class="kpi-delta ${trend}"><span class="pill">${arrow} ${Math.abs(k.delta)}%</span><span class="muted">${k.deltaLabel}</span></div>
  </div>`;
}

export function buildSections(light: TokenMap): Section[] {
  const paletteKeys = COLOR_TOKENS.filter((k) => !k.endsWith("-foreground") && !k.startsWith("sidebar"));
  const palette = paletteKeys
    .map((k) => `<div class="sw"><span class="chip" style="background:var(--${k})"></span><code>${k}</code></div>`)
    .join("");

  return [
    // ---------------- Overview ----------------
    {
      id: "overview",
      group: "Overview",
      title: "Overview",
      desc: "The generated theme and headline indicators. Every element on this page is styled with the same tokens.",
      html: `<div class="demo col"><div class="palette">${palette}</div></div>
        <div class="grid4" style="margin-top:1rem">${kpis.map(kpiCard).join("")}</div>`,
    },

    // ---------------- Forms ----------------
    {
      id: "button",
      group: "Forms",
      title: "Button",
      desc: "Variants, sizes, and states.",
      html:
        demo(
          `<button class="btn btn-primary">Primary</button>
           <button class="btn btn-secondary">Secondary</button>
           <button class="btn btn-outline">Outline</button>
           <button class="btn btn-ghost">Ghost</button>
           <button class="btn btn-destructive">Destructive</button>
           <button class="btn btn-link">Link</button>`,
        ) +
        demo(
          `<button class="btn btn-primary btn-sm">Small</button>
           <button class="btn btn-primary">Default</button>
           <button class="btn btn-primary btn-lg">Large</button>
           <button class="btn btn-outline btn-icon" aria-label="settings">⚙</button>
           <button class="btn btn-primary" disabled>Disabled</button>
           <button class="btn btn-secondary">◐ Loading…</button>`,
        ),
    },
    {
      id: "input",
      group: "Forms",
      title: "Input & Textarea",
      desc: "Text fields with labels and hints.",
      html: demo(
        `<div class="field"><label class="label">Email</label><input class="input" type="email" placeholder="you@imf.org" /><span class="hint">We'll never share it.</span></div>
         <div class="field"><label class="label">Message</label><textarea class="textarea" placeholder="Type your note…"></textarea></div>
         <div class="field"><label class="label">Disabled</label><input class="input" placeholder="Disabled" disabled /></div>`,
        "col",
      ),
    },
    {
      id: "checkbox-radio",
      group: "Forms",
      title: "Checkbox & Radio",
      desc: "Selection controls.",
      html: demo(
        `<label class="check"><input type="checkbox" checked /> Include projections</label>
         <label class="check"><input type="checkbox" /> Seasonally adjusted</label>
         <span class="sep-v" style="height:24px"></span>
         <label class="radio"><input type="radio" name="freq" checked /> Annual</label>
         <label class="radio"><input type="radio" name="freq" /> Quarterly</label>
         <label class="radio"><input type="radio" name="freq" /> Monthly</label>`,
      ),
    },
    {
      id: "switch-slider",
      group: "Forms",
      title: "Switch, Slider & Toggle",
      desc: "Boolean, range, and toggle controls.",
      html: demo(
        `<label class="switch"><input type="checkbox" checked /><span class="track"><span class="thumb"></span></span> Dark projections</label>
         <span class="sep-v" style="height:24px"></span>
         <div style="display:flex;align-items:center;gap:.6rem"><input class="slider" type="range" min="0" max="100" value="64" data-slider /><span class="muted" data-slider-value>64</span></div>
         <span class="sep-v" style="height:24px"></span>
         <div class="toggle-group" data-toggle-group="single"><button class="toggle on" data-toggle>Bold</button><button class="toggle" data-toggle>Italic</button><button class="toggle" data-toggle>Underline</button></div>`,
      ),
    },
    {
      id: "select",
      group: "Forms",
      title: "Select",
      desc: "A custom, keyboard-friendly select.",
      html: demo(
        `<div class="field" data-select><label class="label">Region</label>
          <button class="select-trigger" data-menu-trigger><span data-select-value>Advanced economies</span>${chev}</button>
          <div data-menu>
            <div class="menu-item" data-select-option>Advanced economies</div>
            <div class="menu-item" data-select-option>Emerging markets</div>
            <div class="menu-item" data-select-option>Low-income countries</div>
            <div class="menu-item" data-select-option>Euro area</div>
          </div>
        </div>`,
        "col",
      ),
    },

    // ---------------- Data display ----------------
    {
      id: "badge",
      group: "Data display",
      title: "Badge",
      desc: "Status and category labels.",
      html: demo(
        `<span class="badge badge-primary">Advanced</span>
         <span class="badge badge-secondary">Emerging</span>
         <span class="badge badge-destructive">At risk</span>
         <span class="badge badge-outline">v2.0</span>`,
      ),
    },
    {
      id: "avatar",
      group: "Data display",
      title: "Avatar",
      desc: "User and entity images with fallbacks.",
      html: demo(
        `<span class="avatar">FC</span>
         <span class="avatar" style="background:var(--chart-2);color:#fff">IMF</span>
         <div class="avatar-group"><span class="avatar">A</span><span class="avatar" style="background:var(--chart-3);color:#fff">B</span><span class="avatar" style="background:var(--chart-4);color:#fff">C</span><span class="avatar" style="background:var(--secondary)">+9</span></div>`,
      ),
    },
    {
      id: "card",
      group: "Data display",
      title: "Card",
      desc: "A container with header, content, and footer.",
      html: demo(
        `<div class="card" style="width:340px">
          <div class="card-h"><div class="card-t">World Economic Outlook</div><div class="card-d">October 2026 update</div></div>
          <div class="card-b">Global growth is projected to hold at 3.2%, with disinflation continuing across most regions.</div>
          <div class="card-f"><button class="btn btn-ghost btn-sm">Dismiss</button><button class="btn btn-primary btn-sm">Read report</button></div>
        </div>`,
      ),
    },
    {
      id: "table",
      group: "Data display",
      title: "Table",
      desc: "Rows with hover states and numeric alignment.",
      html: demo(
        `<table class="tbl"><caption>Real GDP growth (%), by group</caption>
          <thead><tr><th>Group</th><th class="num">2024</th><th class="num">2025F</th><th class="num">Weight</th></tr></thead>
          <tbody>
            <tr><td>Advanced economies</td><td class="num">1.8</td><td class="num">2.0</td><td class="num">26.3</td></tr>
            <tr><td>Emerging markets</td><td class="num">4.2</td><td class="num">3.9</td><td class="num">48.1</td></tr>
            <tr><td>Low-income countries</td><td class="num">5.0</td><td class="num">4.7</td><td class="num">8.4</td></tr>
            <tr><td><strong>World</strong></td><td class="num"><strong>3.2</strong></td><td class="num"><strong>3.1</strong></td><td class="num"><strong>100.0</strong></td></tr>
          </tbody></table>`,
        "col",
      ),
    },
    {
      id: "progress-skeleton",
      group: "Data display",
      title: "Progress & Skeleton",
      desc: "Loading and progress indicators.",
      html: demo(
        `<div style="flex:1;min-width:200px"><div class="progress"><span style="width:64%"></span></div></div>
         <span class="sep-v" style="height:36px"></span>
         <div style="display:flex;flex-direction:column;gap:.5rem;flex:1;min-width:200px">
           <div class="skeleton" style="height:12px;width:80%"></div>
           <div class="skeleton" style="height:12px;width:60%"></div>
           <div class="skeleton" style="height:12px;width:70%"></div>
         </div>`,
      ),
    },
    {
      id: "tabs",
      group: "Data display",
      title: "Tabs",
      desc: "Switch between views.",
      html: demo(
        `<div data-tabs style="width:100%">
          <div class="tabs-list"><button data-tab="growth" aria-selected="true">Growth</button><button data-tab="inflation" aria-selected="false">Inflation</button><button data-tab="debt" aria-selected="false">Debt</button></div>
          <div data-tab-panel="growth">World output is projected at 3.2% for 2025, broadly stable versus the prior forecast.</div>
          <div data-tab-panel="inflation" hidden>Headline inflation continues to ease toward central-bank targets in most economies.</div>
          <div data-tab-panel="debt" hidden>Global public debt approaches 93% of GDP, with wide dispersion across groups.</div>
        </div>`,
        "col",
      ),
    },
    {
      id: "accordion",
      group: "Data display",
      title: "Accordion",
      desc: "Vertically stacked, collapsible sections.",
      html: demo(
        `<div data-accordion="single" style="width:100%">
          <div data-acc-item class="open"><button data-acc-trigger aria-expanded="true">What is the WEO?${chev}</button><div class="acc-content"><div class="acc-content-inner">The World Economic Outlook presents the IMF's analysis and projections of economic developments.</div></div></div>
          <div data-acc-item><button data-acc-trigger aria-expanded="false">How often is it published?${chev}</button><div class="acc-content"><div class="acc-content-inner">Twice a year, in April and October, with interim updates in January and July.</div></div></div>
          <div data-acc-item><button data-acc-trigger aria-expanded="false">Where does the data come from?${chev}</button><div class="acc-content"><div class="acc-content-inner">National authorities and IMF staff estimates, compiled into a consistent framework.</div></div></div>
        </div>`,
        "col",
      ),
    },
    {
      id: "carousel",
      group: "Data display",
      title: "Carousel",
      desc: "A slideshow with previous/next controls.",
      html: demo(
        `<div data-carousel style="width:100%">
          <div data-carousel-track>
            <div data-carousel-item>2023</div><div data-carousel-item>2024</div><div data-carousel-item>2025</div><div data-carousel-item>2026</div>
          </div>
          <button data-carousel-prev aria-label="prev">‹</button><button data-carousel-next aria-label="next">›</button>
        </div>`,
        "col",
      ),
    },
    {
      id: "calendar",
      group: "Data display",
      title: "Calendar",
      desc: "A month view for date selection.",
      html: demo(calendarHtml()),
    },
    {
      id: "tooltip-hover",
      group: "Data display",
      title: "Tooltip & Hover Card",
      desc: "Contextual information on hover.",
      html: demo(
        `<span class="tip-wrap"><button class="btn btn-outline">Hover me<span class="tip">Updated 1 Sep 2026</span></button></span>
         <span class="hover-wrap"><button class="btn btn-ghost">@imf</button><div class="hover-card"><div style="display:flex;gap:.6rem;align-items:center"><span class="avatar" style="background:var(--chart-2);color:#fff">IMF</span><div><strong>International Monetary Fund</strong><div class="muted" style="font-size:.78rem">190 member countries</div></div></div><p class="muted" style="font-size:.82rem;margin:.6rem 0 0">Working to foster global monetary cooperation and financial stability.</p></div></span>`,
      ),
    },

    // ---------------- Overlays & menus ----------------
    {
      id: "dialog",
      group: "Overlays & menus",
      title: "Dialog & Alert Dialog",
      desc: "Modal windows for content and confirmations.",
      html: demo(
        `<button class="btn btn-primary" data-open="dlg-edit">Edit forecast</button>
         <button class="btn btn-destructive" data-open="dlg-del">Delete series</button>`,
      ),
    },
    {
      id: "sheet-drawer",
      group: "Overlays & menus",
      title: "Sheet & Drawer",
      desc: "Panels that slide in from an edge.",
      html: demo(
        `<button class="btn btn-outline" data-open="sheet-1">Open sheet →</button>
         <button class="btn btn-outline" data-open="drawer-1">Open drawer ↑</button>`,
      ),
    },
    {
      id: "dropdown",
      group: "Overlays & menus",
      title: "Dropdown & Context Menu",
      desc: "Menus triggered by click or right-click.",
      html: demo(
        `<div data-menu-trigger style="position:relative;display:inline-block">
           <button class="btn btn-outline">Options ${chev}</button>
           <div data-menu>
             <div class="menu-label">Series</div>
             <div class="menu-item">✎ Rename</div>
             <div class="menu-item">⧉ Duplicate</div>
             <div class="menu-sep"></div>
             <div class="menu-item danger">🗑 Delete</div>
           </div>
         </div>
         <div data-context style="position:relative"><div class="card" style="padding:1rem 1.5rem">Right-click me
           <div data-menu><div class="menu-item">Copy value</div><div class="menu-item">Export CSV</div><div class="menu-sep"></div><div class="menu-item danger">Remove</div></div>
         </div></div>`,
      ),
    },
    {
      id: "popover",
      group: "Overlays & menus",
      title: "Popover",
      desc: "Rich floating content anchored to a trigger.",
      html: demo(
        `<div data-menu-trigger style="position:relative;display:inline-block">
          <button class="btn btn-outline">Adjust range</button>
          <div data-menu style="min-width:240px;padding:0.9rem">
            <div class="label">From</div><input class="input" value="2015" />
            <div class="label" style="margin-top:.6rem">To</div><input class="input" value="2029" />
            <button class="btn btn-primary btn-sm" data-menu-trigger style="margin-top:.8rem;width:100%">Apply</button>
          </div>
         </div>`,
      ),
    },
    {
      id: "menubar",
      group: "Overlays & menus",
      title: "Menubar",
      desc: "An application-style menu bar.",
      html: demo(
        `<div class="menubar">
          <div style="position:relative"><button data-menu-trigger>File</button><div data-menu><div class="menu-item">New report</div><div class="menu-item">Open…</div><div class="menu-sep"></div><div class="menu-item">Export PDF</div></div></div>
          <div style="position:relative"><button data-menu-trigger>View</button><div data-menu><div class="menu-item">Light</div><div class="menu-item">Dark</div></div></div>
          <div style="position:relative"><button data-menu-trigger>Help</button><div data-menu><div class="menu-item">Documentation</div><div class="menu-item">About</div></div></div>
        </div>`,
      ),
    },
    {
      id: "command",
      group: "Overlays & menus",
      title: "Command",
      desc: "A ⌘K command palette. Press ⌘K / Ctrl-K to open, or the button.",
      html: demo(
        `<button class="btn btn-outline" onclick="document.getElementById('cmdk').classList.add('open');setTimeout(()=>document.querySelector('[data-cmd-input]').focus(),20)">Open command… <kbd style="margin-left:.5rem;font-size:.7rem;border:1px solid var(--border);border-radius:4px;padding:0 .35rem;background:var(--muted)">⌘K</kbd></button>`,
      ),
    },
    {
      id: "alert",
      group: "Overlays & menus",
      title: "Alert",
      desc: "Inline callouts.",
      html:
        demo(
          `<div class="alert" style="width:100%"><span class="ico">ℹ</span><div><strong>Heads up</strong><div class="muted" style="font-size:.82rem">The October WEO update is now available.</div></div></div>`,
          "col",
        ) +
        demo(
          `<div class="alert alert-destructive" style="width:100%"><span class="ico">⚠</span><div><strong>Downside risk</strong><div style="font-size:.82rem">Financial conditions have tightened materially.</div></div></div>`,
          "col",
        ),
    },
    {
      id: "toast",
      group: "Overlays & menus",
      title: "Toast",
      desc: "Transient notifications (Sonner-style).",
      html: demo(
        `<button class="btn btn-primary" data-toast="Projection saved to your workspace." data-toast-title="Saved">Show toast</button>
         <button class="btn btn-outline" data-toast="Export started — we'll email you when it's ready." data-toast-title="Exporting">Show info toast</button>`,
      ),
    },

    // ---------------- Navigation ----------------
    {
      id: "breadcrumb-pagination",
      group: "Navigation",
      title: "Breadcrumb & Pagination",
      desc: "Wayfinding controls.",
      html:
        demo(
          `<nav class="crumb"><a href="#">Data</a> / <a href="#">WEO</a> / <span class="cur">Real GDP growth</span></nav>`,
          "col",
        ) +
        demo(
          `<nav class="pagination" data-pagination><span data-page>‹</span><span data-page class="active">1</span><span data-page>2</span><span data-page>3</span><span data-page>…</span><span data-page>12</span><span data-page>›</span></nav>`,
        ),
    },
    {
      id: "navmenu",
      group: "Navigation",
      title: "Navigation Menu",
      desc: "A top-level navigation with dropdown panels.",
      html: demo(
        `<div class="menubar" style="border-radius:999px;padding:.25rem">
          <div style="position:relative"><button data-menu-trigger>Publications ${chev}</button><div data-menu style="min-width:280px"><div class="menu-item">World Economic Outlook</div><div class="menu-item">Global Financial Stability Report</div><div class="menu-item">Fiscal Monitor</div></div></div>
          <div style="position:relative"><button data-menu-trigger>Data ${chev}</button><div data-menu><div class="menu-item">DataMapper</div><div class="menu-item">WEO database</div></div></div>
          <button data-menu-trigger style="border:none;background:transparent;padding:.35rem .7rem;cursor:pointer">About</button>
        </div>`,
      ),
    },

    // ---------------- Extensions ----------------
    {
      id: "sparkline-stat",
      group: "Extensions",
      title: "Sparkline & Stat Card",
      desc: "Registry extension components — installable via npx shadcn add.",
      html: `<div class="grid4">${kpis.map(kpiCard).join("")}</div>`,
    },

    // ---------------- Scientific charts ----------------
    {
      id: "charts",
      group: "Scientific charts",
      title: "Scientific charts",
      desc: "Statistical charts rendered client-side with Observable Plot (KDE, OLS regression + confidence band, quantiles, correlation). Hover for values.",
      html: `<div class="card plot-card" data-chart="areaband" data-title="World GDP growth — WEO projection" style="margin-bottom:1rem"></div>
        <div class="grid2">
          <div class="card plot-card" data-chart="histogram" data-title="Distribution of country growth"></div>
          <div class="card plot-card" data-chart="scatter" data-title="Phillips curve"></div>
          <div class="card plot-card" data-chart="boxplot" data-title="Growth dispersion by group"></div>
          <div class="card plot-card" data-chart="heatmap" data-title="Macro indicator correlations"></div>
        </div>`,
    },
  ];
}

/** A static month grid for the calendar demo. */
function calendarHtml(): string {
  const dows = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const offset = 5; // month starts on Friday
  const cells: string[] = dows.map((d) => `<span class="dow">${d}</span>`);
  for (let i = 0; i < offset; i++) cells.push(`<span class="day out">${28 + i}</span>`);
  for (let d = 1; d <= 30; d++) cells.push(`<span class="day${d === 12 ? " sel" : ""}">${d}</span>`);
  return `<div class="cal"><div class="cal-h"><button class="btn btn-ghost btn-icon btn-sm">‹</button><span>September 2026</span><button class="btn btn-ghost btn-icon btn-sm">›</button></div><div class="cal-grid">${cells.join("")}</div></div>`;
}
