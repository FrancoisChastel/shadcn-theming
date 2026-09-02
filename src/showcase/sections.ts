/**
 * HTML builders for every component in the explorer, grouped for the sidebar.
 * Each returns a `Section` with a demo that is interactive via the inlined
 * runtime (see runtime-ui.ts). All markup is token-driven (see styles.ts).
 */
import { COLOR_TOKENS, type TokenMap } from "../core/tokens.js";
import { parseColor, toHex } from "../core/color.js";
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

  // ---- color-panel helpers (values shown are the light theme; swatches are live) ----
  const val = (k: string) => light[k as keyof TokenMap] ?? "";
  const safeHex = (v: string) => {
    try {
      return toHex(parseColor(v));
    } catch {
      return "";
    }
  };
  const meta = (key: string) => {
    const v = val(key);
    const hex = safeHex(v);
    return `<div class="color-meta"><code class="color-name">--${key}</code><code class="color-val">${v}</code>${hex ? `<code class="color-hex">${hex}</code>` : ""}</div>`;
  };
  const pairCard = (surface: string, fg: string) =>
    `<div class="color-card"><div class="color-swatch" style="background:var(--${surface});color:var(--${fg})">Aa</div>${meta(surface)}</div>`;
  const soloCard = (key: string) =>
    `<div class="color-card"><div class="color-swatch bordered" style="background:var(--${key})"></div>${meta(key)}</div>`;
  const colorGroup = (title: string, cards: string) =>
    `<div class="color-group-title">${title}</div><div class="color-grid">${cards}</div>`;

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

    // ---------------- Foundations ----------------
    {
      id: "colors",
      group: "Foundations",
      title: "Colors",
      desc: "The full semantic color palette. Swatches are live (toggle the theme); the values shown are the light-theme OKLCH plus an sRGB hex.",
      html: `<div class="demo col">
        ${colorGroup("Base", pairCard("background", "foreground") + pairCard("card", "card-foreground") + pairCard("popover", "popover-foreground") + pairCard("muted", "muted-foreground"))}
        ${colorGroup("Brand & feedback", pairCard("primary", "primary-foreground") + pairCard("secondary", "secondary-foreground") + pairCard("accent", "accent-foreground") + pairCard("destructive", "destructive-foreground"))}
        ${colorGroup("Lines & ring", soloCard("border") + soloCard("input") + soloCard("ring"))}
        ${colorGroup("Charts", ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"].map(soloCard).join(""))}
        ${colorGroup("Sidebar", pairCard("sidebar", "sidebar-foreground") + pairCard("sidebar-primary", "sidebar-primary-foreground") + pairCard("sidebar-accent", "sidebar-accent-foreground") + soloCard("sidebar-border") + soloCard("sidebar-ring"))}
      </div>`,
    },
    {
      id: "typography",
      group: "Foundations",
      title: "Typography",
      desc: "The type scale, set in the brand's font.",
      html: demo(
        `<div class="type-specimens" style="width:100%">
          <div class="type-row"><span class="type-sample" style="font-size:2.5rem;font-weight:650;letter-spacing:-0.02em">Global growth outlook</span><span class="type-meta">Display · 40 / 650</span></div>
          <div class="type-row"><span class="type-sample" style="font-size:1.875rem;font-weight:600;letter-spacing:-0.02em">World Economic Outlook</span><span class="type-meta">H1 · 30 / 600</span></div>
          <div class="type-row"><span class="type-sample" style="font-size:1.5rem;font-weight:600">Regional analysis</span><span class="type-meta">H2 · 24 / 600</span></div>
          <div class="type-row"><span class="type-sample" style="font-size:1.25rem;font-weight:600">Projected indicators</span><span class="type-meta">H3 · 20 / 600</span></div>
          <div class="type-row"><span class="type-sample" style="font-size:1rem">Global growth is projected to hold at 3.2% in 2025 as disinflation continues across most economies.</span><span class="type-meta">Body · 16 / 400</span></div>
          <div class="type-row"><span class="type-sample muted" style="font-size:0.8125rem">Source: IMF staff estimates · synthetic data</span><span class="type-meta">Small · 13 / 400</span></div>
          <div class="type-row"><span class="type-sample mono" style="font-size:0.8125rem">NGDP_RPCH @ WEO = 3.20</span><span class="type-meta">Mono · 13</span></div>
        </div>`,
        "col",
      ),
    },
    {
      id: "radius",
      group: "Foundations",
      title: "Radius",
      desc: "Corner radii derived from the --radius token.",
      html: demo(
        `<div class="radius-row">
          <div class="radius-item"><span class="radius-box" style="border-radius:calc(var(--radius) - 4px)"></span>sm</div>
          <div class="radius-item"><span class="radius-box" style="border-radius:calc(var(--radius) - 2px)"></span>md</div>
          <div class="radius-item"><span class="radius-box" style="border-radius:var(--radius)"></span>lg</div>
          <div class="radius-item"><span class="radius-box" style="border-radius:calc(var(--radius) + 4px)"></span>xl</div>
          <div class="radius-item"><span class="radius-box" style="border-radius:999px"></span>full</div>
        </div>`,
      ),
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

    // ---------------- Layout ----------------
    {
      id: "page-header",
      group: "Layout",
      title: "Page header",
      desc: "A page title block with breadcrumb, description, actions, and tabs.",
      html: demo(
        `<div class="page-header">
          <nav class="crumb"><a href="#">Data</a> / <a href="#">WEO</a> / <span class="cur">Real GDP growth</span></nav>
          <div class="ph-row">
            <div><h2>Real GDP growth</h2><p class="muted">World Economic Outlook · updated 1 Sep 2026</p></div>
            <div class="ph-actions"><button class="btn btn-outline btn-sm">Export</button><button class="btn btn-primary btn-sm">New projection</button></div>
          </div>
          <div data-tabs><div class="tabs-list"><button data-tab="a" aria-selected="true">Overview</button><button data-tab="b" aria-selected="false">By region</button><button data-tab="c" aria-selected="false">History</button></div><div data-tab-panel="a"></div><div data-tab-panel="b" hidden></div><div data-tab-panel="c" hidden></div></div>
        </div>`,
        "col",
      ),
    },
    {
      id: "bento",
      group: "Layout",
      title: "Bento grid",
      desc: "An editorial grid with mixed spans.",
      html: demo(
        `<div class="bento">
          <div class="card lg"><span class="b-title">World GDP growth</span><span class="b-value">3.2%</span><span class="muted" style="font-size:.72rem">+0.1 vs April WEO</span></div>
          <div class="card"><span class="b-title">Inflation</span><span class="b-value">5.8%</span></div>
          <div class="card"><span class="b-title">Unemployment</span><span class="b-value">6.1%</span></div>
          <div class="card wide"><span class="b-title">Public debt / GDP</span><span class="b-value">93.2%</span></div>
          <div class="card"><span class="b-title">Trade</span><span class="b-value">+3.4%</span></div>
          <div class="card"><span class="b-title">Reserves</span><span class="b-value">12.1T</span></div>
        </div>`,
        "col",
      ),
    },
    {
      id: "split",
      group: "Layout",
      title: "Split view",
      desc: "A master–detail layout: a list pane beside a detail pane.",
      html: demo(
        `<div class="split">
          <div class="split-pane list"><div class="li active">Advanced economies</div><div class="li">Emerging markets</div><div class="li">Low-income countries</div><div class="li">Euro area</div><div class="li">ASEAN-5</div></div>
          <div class="split-handle"></div>
          <div class="split-pane"><h3 style="margin:0 0 .4rem">Advanced economies</h3><p class="muted" style="font-size:.85rem;margin:0 0 .8rem">Real GDP growth is projected at 1.8% in 2025, little changed from the prior forecast.</p><div class="grid3"><div class="card" style="padding:.7rem"><span class="muted" style="font-size:.7rem">2024</span><div style="font-weight:650">1.8%</div></div><div class="card" style="padding:.7rem"><span class="muted" style="font-size:.7rem">2025F</span><div style="font-weight:650">2.0%</div></div><div class="card" style="padding:.7rem"><span class="muted" style="font-size:.7rem">Weight</span><div style="font-weight:650">26.3</div></div></div></div>
        </div>`,
        "col",
      ),
    },
    {
      id: "dashboard-shell",
      group: "Layout",
      title: "Dashboard shell",
      desc: "The app-shell foundation: sidebar, top bar, and a content area.",
      html: demo(
        `<div class="mini-app">
          <div class="mini-side"><div class="m-brand"><span class="m-dot"></span> IMF</div><div class="m-item on">Overview</div><div class="m-item">Indicators</div><div class="m-item">Projections</div><div class="m-item">Reports</div></div>
          <div><div class="mini-top"><span class="badge badge-secondary">Q3 2026</span><span class="muted" style="font-size:.75rem;margin-left:auto">francois@imf.org</span></div>
            <div class="mini-content"><div class="m-kpi"><span class="muted" style="font-size:.65rem">GDP</span><b>3.2%</b></div><div class="m-kpi"><span class="muted" style="font-size:.65rem">CPI</span><b>5.8%</b></div><div class="m-kpi"><span class="muted" style="font-size:.65rem">Debt</span><b>93%</b></div><div class="m-chart"></div></div>
          </div>
        </div>`,
        "col",
      ),
    },
    {
      id: "stack",
      group: "Layout",
      title: "Stack",
      desc: "Vertical and horizontal stacks with consistent gaps.",
      html: demo(
        `<div class="stack-demo">
          <div class="vstack"><span class="stack-box">Item 1</span><span class="stack-box">Item 2</span><span class="stack-box">Item 3</span></div>
          <div class="hstack"><span class="stack-box">A</span><span class="stack-box">B</span><span class="stack-box">C</span><span class="stack-box">D</span></div>
        </div>`,
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

    // ---------------- Communication ----------------
    {
      id: "chat",
      group: "Communication",
      title: "Chat",
      desc: "A conversational UI — message bubbles, a typing indicator, and a live composer. Type a message and send.",
      html: demo(
        `<div class="chat card" data-chat>
          <div class="chat-head"><span class="avatar" style="background:var(--chart-2);color:#fff">IMF</span><div><strong>WEO Assistant</strong><div style="font-size:.72rem"><span class="status">●</span> <span class="muted">online</span></div></div></div>
          <div class="chat-body" data-chat-body>
            <div class="msg in"><div class="bubble">Hi! Ask me about the latest World Economic Outlook projections.</div><span class="msg-time">09:24</span></div>
            <div class="msg out"><div class="bubble">What's the 2025 world growth forecast?</div><span class="msg-time">09:25</span></div>
            <div class="msg in"><div class="bubble">Global growth is projected at 3.1% for 2025, broadly stable versus the April forecast.</div><span class="msg-time">09:25</span></div>
          </div>
          <form class="chat-input" data-chat-form>
            <input class="input" data-chat-text placeholder="Type a message…" autocomplete="off" />
            <button class="btn btn-primary" type="submit">Send</button>
          </form>
        </div>`,
        "col",
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
