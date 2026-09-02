/**
 * HTML builders for every component in the explorer, grouped for the sidebar.
 * Each returns a `Section` with a demo that is interactive via the inlined
 * runtime (see runtime-ui.ts). All markup is token-driven (see styles.ts).
 */
import { COLOR_TOKENS, type TokenMap } from "../core/tokens.js";
import { parseColor, toHex } from "../core/color.js";
import { kpis, type Kpi } from "./data.js";
import { aiSections } from "./ai-sections.js";

export interface Section {
  id: string;
  group: string;
  title: string;
  desc: string;
  html: string;
}

const demo = (inner: string, cls = "") => `<div class="demo ${cls}">${inner}</div>`;
const chev = '<svg class="chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>';

/** A faux-browser frame around a full-page template preview. */
const blockFrame = (url: string, inner: string) =>
  `<div class="block-frame"><div class="block-bar"><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="url">${url}</span></div><div class="block-stage">${inner}</div></div>`;

/** A tiny inline-SVG sparkline (no runtime needed). */
function sparklineSvg(data: number[], color: string): string {
  const w = 96;
  const h = 30;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => [i * step, h - 1.5 - ((v - min) / range) * (h - 3)] as const);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1]!;
  return `<svg viewBox="0 0 ${w} ${h}" class="spark" preserveAspectRatio="none"><path d="${line} L${w},${h} L0,${h} Z" fill="${color}" fill-opacity="0.1"/><path d="${line}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="2" fill="${color}"/></svg>`;
}

function kpiCard(k: Kpi): string {
  const trend = k.delta > 0 ? "up" : "down";
  const arrow = k.delta > 0 ? "▲" : "▼";
  return `<div class="card kpi">
    <span class="muted" style="font-size:.8rem">${k.label}</span>
    <div class="kpi-mid"><div class="kpi-value">${k.value}</div>
      ${sparklineSvg(k.data, trend === "down" ? "var(--destructive)" : "var(--chart-1)")}</div>
    <div class="kpi-delta ${trend}"><span class="pill">${arrow} ${Math.abs(k.delta)}%</span><span class="muted">${k.deltaLabel}</span></div>
  </div>`;
}

export function buildSections(light: TokenMap, brandName = "Brand"): Section[] {
  const init = brandName.trim().charAt(0).toUpperCase() || "•";
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

    {
      id: "form-field",
      group: "Forms",
      title: "Form field & validation",
      desc: "Label, description, required, and inline error states. The email validates live on input.",
      html: demo(
        `<div class="form-field"><label class="label">Institutional email <span class="req">*</span></label><input class="input" data-validate="email" placeholder="you@imf.org" /><span class="hint">We'll only use this to sign you in.</span><span class="err-msg" data-err hidden>Enter a valid email address.</span></div>
         <div class="form-field"><label class="label">API token</label><input class="input invalid" value="expired-token" /><span class="err-msg">This token has expired. Generate a new one.</span></div>
         <div class="form-field"><label class="label">Display name</label><input class="input" value="Francois Chastel" /><span class="hint">Shown on your published reports.</span></div>`,
        "col",
      ),
    },
    {
      id: "combobox",
      group: "Forms",
      title: "Combobox & multi-select",
      desc: "Searchable single-select and a checkbox multi-select with chips.",
      html: demo(
        `<div class="field" data-combobox><label class="label">Country</label>
          <button class="combobox-trigger" data-menu-trigger><span data-combobox-value class="ph">Select a country…</span>${chev}</button>
          <div data-menu><input class="cb-search" data-cb-search placeholder="Search…" /><div class="cb-list">${["United States", "France", "Japan", "Germany", "Brazil", "India", "Nigeria", "Mexico", "Indonesia", "South Africa"].map((c) => `<div class="menu-item" data-cb-option>${c}</div>`).join("")}</div></div>
        </div>
        <div class="field" data-multiselect><label class="label">Regions</label>
          <button class="multiselect-trigger" data-menu-trigger><span class="ms-chips" data-ms-chips><span class="ph">Select regions…</span></span>${chev}</button>
          <div data-menu>${["Advanced economies", "Emerging markets", "Low-income", "Euro area", "ASEAN-5"].map((r) => `<label class="check-line"><input type="checkbox" data-ms-option value="${r}" /> ${r}</label>`).join("")}</div>
        </div>`,
      ),
    },
    {
      id: "datepicker",
      group: "Forms",
      title: "Date picker",
      desc: "An input with a calendar popover.",
      html: demo(
        `<div class="field" data-datepicker style="position:relative">
          <label class="label">Reference date</label>
          <button class="combobox-trigger" data-menu-trigger><span data-dp-value class="ph">Pick a date</span><span>📅</span></button>
          <div data-menu>${calendarHtml()}</div>
        </div>`,
      ),
    },
    {
      id: "otp-password",
      group: "Forms",
      title: "Input OTP & password",
      desc: "A one-time-code input (auto-advances, handles paste) and a password field with a strength meter.",
      html: demo(
        `<div class="field"><label class="label">Verification code</label><div class="otp" data-otp>${Array.from({ length: 6 }, () => `<input maxlength="1" inputmode="numeric" aria-label="digit" />`).join("")}</div></div>
         <div class="field"><label class="label">Password</label><div class="pw-wrap"><input class="input" type="password" data-password placeholder="••••••••" /><button class="toggle-pw" data-toggle-pw type="button" aria-label="show">👁</button></div><div class="pw-meter"><span data-pw-bar></span></div><span class="pw-hint" data-pw-hint>Use 8+ characters with letters, numbers &amp; symbols.</span></div>`,
      ),
    },
    {
      id: "file-upload",
      group: "Forms",
      title: "File upload",
      desc: "A dropzone that accepts clicks and drag-and-drop.",
      html: demo(
        `<label class="dropzone" data-dropzone><input type="file" hidden data-dz-input />
          <div>⬆ <strong>Click to upload</strong> or drag and drop</div>
          <div class="muted" style="font-size:.72rem">CSV, XLSX up to 10MB</div>
          <div class="dz-file" data-dz-file hidden></div>
        </label>`,
        "col",
      ),
    },
    {
      id: "search-tags",
      group: "Forms",
      title: "Search, tags & segmented",
      desc: "A search input with clear, a tag input, a segmented control, and a currency input.",
      html: demo(
        `<div class="input-icon" data-search style="max-width:280px"><span class="lead">🔍</span><input class="input" data-search-input placeholder="Search indicators…" /><button class="clear" data-search-clear aria-label="clear">×</button></div>
         <div class="tags" data-tags style="max-width:280px"><span class="tag">macro<button data-tag-remove aria-label="remove">×</button></span><span class="tag">weo<button data-tag-remove aria-label="remove">×</button></span><input data-tags-input placeholder="Add tag…" /></div>
         <div class="segmented" data-segmented><button class="on">Chart</button><button>Table</button><button>Map</button></div>
         <div class="input-icon" style="max-width:160px"><span class="lead" aria-hidden="true">$</span><input class="input" value="48,200" inputmode="numeric" aria-label="Amount in USD" /></div>`,
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
      id: "data-table",
      group: "Data display",
      title: "Data table",
      desc: "An interactive table — click a header to sort, filter by name, select rows, paginate, and export CSV.",
      html: demo(dataTableHtml(), "col"),
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

    // ---------------- Blocks (page templates) ----------------
    {
      id: "login",
      group: "Blocks",
      title: "Login",
      desc: "A sign-in page with email/password, remember-me, SSO, and sign-up link.",
      html: demo(
        blockFrame(
          "app.imf.org/login",
          `<div class="auth-card">
            <div class="auth-logo">${init}</div>
            <h3>Sign in</h3><p class="sub">Access the ${brandName} data workspace</p>
            <div class="field auth-fld"><label class="label">Email</label><input class="input" placeholder="you@imf.org" /></div>
            <div class="field auth-fld"><label class="label">Password</label><div class="pw-wrap"><input class="input" type="password" placeholder="••••••••" /><button class="toggle-pw" data-toggle-pw type="button">👁</button></div></div>
            <div class="row-between"><label class="check"><input type="checkbox" /> Remember me</label><a href="#" style="color:var(--primary)">Forgot password?</a></div>
            <button class="btn btn-primary">Sign in</button>
            <div class="auth-divider">or</div>
            <button class="btn btn-outline">◈ Continue with SSO</button>
            <div class="auth-foot">New here? <a href="#">Create an account</a></div>
          </div>`,
        ),
        "col",
      ),
    },
    {
      id: "signup",
      group: "Blocks",
      title: "Sign up",
      desc: "A registration page with name, email, password strength, and terms.",
      html: demo(
        blockFrame(
          "app.imf.org/signup",
          `<div class="auth-card">
            <div class="auth-logo">${init}</div>
            <h3>Create your account</h3><p class="sub">Start exploring ${brandName} data</p>
            <div class="field auth-fld"><label class="label">Full name</label><input class="input" placeholder="Jane Analyst" /></div>
            <div class="field auth-fld"><label class="label">Email</label><input class="input" placeholder="you@imf.org" /></div>
            <div class="field auth-fld"><label class="label">Password</label><div class="pw-wrap"><input class="input" type="password" data-password placeholder="••••••••" /><button class="toggle-pw" data-toggle-pw type="button">👁</button></div><div class="pw-meter"><span data-pw-bar></span></div></div>
            <label class="check" style="margin-bottom:.85rem;font-size:.8rem"><input type="checkbox" /> I agree to the terms &amp; privacy policy</label>
            <button class="btn btn-primary">Create account</button>
            <div class="auth-foot">Already have an account? <a href="#">Sign in</a></div>
          </div>`,
        ),
        "col",
      ),
    },
    {
      id: "forgot-password",
      group: "Blocks",
      title: "Forgot password",
      desc: "Request a password-reset link.",
      html: demo(
        blockFrame(
          "app.imf.org/forgot",
          `<div class="auth-card">
            <div class="auth-logo">${init}</div>
            <h3>Reset your password</h3><p class="sub">We'll email you a secure reset link</p>
            <div class="field auth-fld"><label class="label">Email</label><input class="input" placeholder="you@imf.org" /></div>
            <button class="btn btn-primary">Send reset link</button>
            <div class="auth-foot"><a href="#">← Back to sign in</a></div>
          </div>`,
        ),
        "col",
      ),
    },
    {
      id: "two-factor",
      group: "Blocks",
      title: "Two-factor",
      desc: "Enter the one-time verification code.",
      html: demo(
        blockFrame(
          "app.imf.org/verify",
          `<div class="auth-card">
            <div class="auth-logo">${init}</div>
            <h3>Two-factor authentication</h3><p class="sub">Enter the 6-digit code from your authenticator</p>
            <div class="otp" data-otp style="justify-content:center;margin-bottom:1.1rem">${Array.from({ length: 6 }, () => `<input maxlength="1" inputmode="numeric" aria-label="digit" />`).join("")}</div>
            <button class="btn btn-primary">Verify</button>
            <div class="auth-foot">Didn't get a code? <a href="#">Resend</a></div>
          </div>`,
        ),
        "col",
      ),
    },
    {
      id: "error-404",
      group: "Blocks",
      title: "Error page",
      desc: "A friendly 404 with recovery actions.",
      html: demo(
        blockFrame(
          "app.imf.org/404",
          `<div class="errstate"><div class="code">404</div><h3>Page not found</h3><p>The page you're looking for doesn't exist or has moved.</p><div style="display:flex;gap:.5rem;justify-content:center"><button class="btn btn-outline">Go back</button><button class="btn btn-primary">Home</button></div></div>`,
        ),
        "col",
      ),
    },
    {
      id: "empty-state",
      group: "Blocks",
      title: "Empty state",
      desc: "A first-run placeholder that prompts the next action.",
      html: demo(
        `<div class="emptystate" style="max-width:380px;margin:0 auto"><div class="ico">📊</div><h4>No datasets yet</h4><p>Create your first projection to see it here.</p><button class="btn btn-primary btn-sm">New projection</button></div>`,
        "col",
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

    // ---------------- AI harness ----------------
    ...aiSections(brandName),

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
    {
      id: "chart-gallery",
      group: "Scientific charts",
      title: "Chart gallery",
      desc: "More Observable-Plot chart types — time series, bars, area, donut, bullet, and lollipop — all theme-colored with legends and hover tips.",
      html: `<div class="grid2">
          <div class="card plot-card" data-chart="timeseries" data-title="Real GDP growth by region"></div>
          <div class="card plot-card" data-chart="area-stacked" data-title="Contribution to growth (stacked)"></div>
          <div class="card plot-card" data-chart="bar-grouped" data-title="Indicators by region (grouped)"></div>
          <div class="card plot-card" data-chart="bar-stacked" data-title="Indicators by region (stacked)"></div>
          <div class="card plot-card" data-chart="diverging" data-title="Current-account balance"></div>
          <div class="card plot-card" data-chart="lollipop" data-title="Current account — ranked"></div>
          <div class="card plot-card" data-chart="donut" data-title="Allocated reserves by currency"></div>
          <div class="card plot-card" data-chart="bullet" data-title="Targets vs actuals"></div>
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
  return `<div class="cal"><div class="cal-h"><button class="btn btn-ghost btn-icon btn-sm" aria-label="Previous month">‹</button><span>September 2026</span><button class="btn btn-ghost btn-icon btn-sm" aria-label="Next month">›</button></div><div class="cal-grid">${cells.join("")}</div></div>`;
}

/** An interactive data-table demo (sort / filter / select / paginate / export). */
function dataTableHtml(): string {
  const rows: Array<[string, number, number, number, string]> = [
    ["United States", 2.8, 3.1, 121, "Advanced"],
    ["China", 5.0, 0.7, 83, "Emerging"],
    ["Japan", 1.9, 2.8, 252, "Advanced"],
    ["Germany", 0.2, 2.9, 64, "Euro area"],
    ["India", 6.8, 4.6, 82, "Emerging"],
    ["Brazil", 2.9, 4.1, 88, "Emerging"],
    ["United Kingdom", 0.7, 2.5, 101, "Advanced"],
    ["France", 1.1, 2.4, 111, "Euro area"],
    ["Nigeria", 3.1, 24.7, 46, "Low-income"],
    ["Mexico", 2.2, 4.7, 53, "Emerging"],
    ["Indonesia", 5.1, 2.8, 39, "Emerging"],
    ["South Africa", 1.2, 5.2, 74, "Emerging"],
  ];
  const body = rows
    .map(
      (r) =>
        `<tr><td class="dt-check"><input type="checkbox" data-dt-row aria-label="Select ${r[0]}" /></td><td>${r[0]}</td><td class="num">${r[1].toFixed(1)}</td><td class="num">${r[2].toFixed(1)}</td><td class="num">${r[3]}</td><td>${r[4]}</td></tr>`,
    )
    .join("");
  const sortInd = '<svg class="sort-ind" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path d="m6 15 6-6 6 6"/></svg>';
  return `<div class="dtable" data-datatable data-page-size="6">
    <div class="dtable-toolbar">
      <input class="input" data-dt-search placeholder="Filter countries…" aria-label="Filter countries" style="max-width:220px" />
      <span class="muted" data-dt-count></span>
      <button class="btn btn-outline btn-sm" data-dt-export style="margin-left:auto">Export CSV</button>
    </div>
    <div class="dtable-scroll">
      <table class="tbl dt">
        <thead><tr>
          <th class="dt-check"><input type="checkbox" data-dt-all aria-label="Select all rows" /></th>
          <th data-dt-sort="1">Country ${sortInd}</th>
          <th data-dt-sort="2" data-dt-type="num" class="num">GDP growth ${sortInd}</th>
          <th data-dt-sort="3" data-dt-type="num" class="num">Inflation ${sortInd}</th>
          <th data-dt-sort="4" data-dt-type="num" class="num">Debt/GDP ${sortInd}</th>
          <th data-dt-sort="5">Region ${sortInd}</th>
        </tr></thead>
        <tbody data-dt-body>${body}</tbody>
      </table>
    </div>
    <div class="dtable-foot">
      <span data-dt-selected>0 selected</span>
      <div class="pagination" data-dt-pager></div>
    </div>
  </div>`;
}
