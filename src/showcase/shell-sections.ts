/**
 * Enterprise app-shell library — the navigation chrome that business software
 * is built from: multi-variant headers (incl. a two-level masthead with a
 * mega-menu), sidebars (icon rail + grouped nav + user card), footers (app
 * status bar, multi-column site footer, legal/classification bar), and a
 * composed shell that assembles them. All theme-token driven and reusable.
 */
import type { Section } from "./sections.js";
import { icon } from "./icons.js";
import { clsBadge } from "./classification.js";

const demo = (inner: string, cls = "") => `<div class="demo ${cls}">${inner}</div>`;
const frame = (url: string, inner: string) =>
  `<div class="block-frame"><div class="block-bar"><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="url">${url}</span></div><div class="block-stage" style="padding:0;display:block">${inner}</div></div>`;

/** Two-level enterprise masthead: utility bar over the main nav bar. */
function twoLevelHeader(): string {
  return `<header class="ent-header">
    <div class="ent-utility">
      <button class="ent-org" data-menu-trigger>${icon("building", { size: 14 })} International Monetary Fund ${icon("chevron-down", { size: 12 })}</button>
      <nav class="ent-util-links" aria-label="Utility">
        <a href="#">${icon("globe", { size: 14 })} EN</a>
        <a href="#">${icon("life-buoy", { size: 14 })} Help</a>
        <a href="#" class="ent-util-bell" aria-label="Notifications">${icon("bell", { size: 14 })}<span class="ent-count">3</span></a>
        <a href="#" class="ent-util-user">${icon("user", { size: 14 })} F. Chastel ${icon("chevron-down", { size: 12 })}</a>
      </nav>
    </div>
    <div class="ent-main">
      <a class="ent-brand" href="#"><span class="ent-logo">IMF</span><span class="ent-word">DataPortal</span></a>
      <nav class="ent-nav" aria-label="Primary">
        <a class="on" href="#">Overview</a>
        <div class="ent-item">
          <a href="#" aria-haspopup="true">Data ${icon("chevron-down", { size: 12 })}</a>
          <div class="ent-mega" role="menu">
            <div class="ent-mega-col"><h5>Indicators</h5><a href="#">National accounts</a><a href="#">Prices &amp; inflation</a><a href="#">Government finance</a><a href="#">Balance of payments</a></div>
            <div class="ent-mega-col"><h5>Datasets</h5><a href="#">World Economic Outlook</a><a href="#">International Financial Statistics</a><a href="#">Direction of Trade</a></div>
            <div class="ent-mega-col ent-mega-feature"><h5>Featured</h5><p class="muted">WEO October 2026 vintage is now available with revised projections.</p><a class="btn btn-primary btn-sm" href="#">Explore WEO</a></div>
          </div>
        </div>
        <a href="#">Publications</a>
        <a href="#">Countries</a>
        <a href="#">Analytics</a>
      </nav>
      <div class="ent-actions">
        <div class="input-icon ent-search"><span class="lead" aria-hidden="true">${icon("search", { size: 15 })}</span><input class="input" placeholder="Search data &amp; docs…" aria-label="Search" /></div>
        <button class="btn btn-primary btn-sm">Sign in</button>
      </div>
    </div>
  </header>`;
}

/** Single-level application header with sidebar toggle, breadcrumb, and tools. */
function appHeader(): string {
  return `<header class="app-header">
    <button class="icon-btn" aria-label="Toggle sidebar">${icon("panel-left", { size: 18 })}</button>
    <nav class="crumb" aria-label="Breadcrumb"><a href="#">Data</a> / <a href="#">WEO</a> / <span class="cur">Real GDP growth</span></nav>
    <div class="app-header-spacer"></div>
    <button type="button" class="search app-header-search" aria-label="Search"><span aria-hidden="true">${icon("search", { size: 15 })}</span> Search <kbd>⌘K</kbd></button>
    <button class="icon-btn" aria-label="Notifications">${icon("bell", { size: 18 })}</button>
    <button class="icon-btn" aria-label="Help">${icon("help-circle", { size: 18 })}</button>
    <span class="avatar avatar-sm" aria-hidden="true">FC</span>
  </header>`;
}

/** Marketing / public site header. */
function siteHeader(): string {
  return `<header class="site-header">
    <a class="ent-brand" href="#"><span class="ent-logo">IMF</span><span class="ent-word">Research</span></a>
    <nav class="site-nav" aria-label="Site">
      <a href="#">Data</a><a href="#">Publications</a><a href="#">Countries</a><a href="#">About</a>
    </nav>
    <div class="site-cta"><a class="site-signin" href="#">Sign in</a><button class="btn btn-primary btn-sm">Get access</button></div>
  </header>`;
}

/** Compact / condensed toolbar header. */
function compactHeader(): string {
  return `<header class="compact-header">
    <div class="ch-left"><span class="ch-title">Projections</span><span class="badge badge-secondary">Working scenario</span></div>
    <div data-tabs class="ch-tabs"><div class="tabs-list"><button data-tab="a" aria-selected="true">Chart</button><button data-tab="b" aria-selected="false">Table</button><button data-tab="c" aria-selected="false">Notes</button></div><div data-tab-panel="a"></div><div data-tab-panel="b" hidden></div><div data-tab-panel="c" hidden></div></div>
    <div class="ch-actions"><button class="btn btn-ghost btn-sm">Discard</button><button class="btn btn-outline btn-sm">Save draft</button><button class="btn btn-primary btn-sm">Publish</button></div>
  </header>`;
}

/** Enterprise sidebar: icon rail + grouped nav + user card. */
function enterpriseSidebar(): string {
  const rail = `<div class="side-rail">
    <span class="rail-logo">I</span>
    <button class="rail-i on" aria-label="Dashboard">${icon("layout-dashboard", { size: 18 })}</button>
    <button class="rail-i" aria-label="Data">${icon("database", { size: 18 })}</button>
    <button class="rail-i" aria-label="Charts">${icon("bar-chart", { size: 18 })}</button>
    <button class="rail-i" aria-label="Documents">${icon("file-text", { size: 18 })}</button>
    <button class="rail-i" aria-label="Settings" style="margin-top:auto">${icon("settings", { size: 18 })}</button>
  </div>`;
  const full = `<nav class="side-full" aria-label="Sidebar">
    <div class="side-search"><div class="input-icon"><span class="lead" aria-hidden="true">${icon("search", { size: 14 })}</span><input class="input" placeholder="Jump to…" aria-label="Jump to" /></div></div>
    <div class="side-group">Workspace</div>
    <a class="side-link on" href="#">${icon("layout-dashboard", { size: 16 })} Overview</a>
    <a class="side-link" href="#">${icon("bar-chart", { size: 16 })} Indicators</a>
    <a class="side-link" href="#">${icon("activity", { size: 16 })} Projections</a>
    <div class="side-group">Library</div>
    <a class="side-link" href="#">${icon("file-text", { size: 16 })} Publications</a>
    <a class="side-link" href="#">${icon("folder", { size: 16 })} Datasets <span class="side-tag">12</span></a>
    <a class="side-link" href="#">${icon("bookmark", { size: 16 })} Saved</a>
    <div class="side-user" data-menu-trigger>
      <span class="avatar avatar-sm">FC</span><span class="side-user-meta"><b>F. Chastel</b><span>Economist</span></span>${icon("chevrons-right", { size: 15 })}
    </div>
  </nav>`;
  return `<div class="shell-side">${rail}${full}</div>`;
}

/** App status-bar footer. */
function appFooter(): string {
  return `<footer class="app-footer">
    <span class="status-dot ok"></span> All systems operational
    <span class="af-sep"></span> v2.4.0
    <span class="af-sep"></span> <span class="badge badge-outline">Production</span>
    <div class="af-right"><a href="#">Docs</a><a href="#">API</a><a href="#">Changelog</a><a href="#">Status</a></div>
  </footer>`;
}

/** Multi-column enterprise site footer. */
function siteFooter(): string {
  const col = (h: string, links: string[]) => `<div class="sf-col"><h5>${h}</h5>${links.map((l) => `<a href="#">${l}</a>`).join("")}</div>`;
  return `<footer class="site-footer">
    <div class="sf-cols">
      <div class="sf-brand">
        <span class="ent-logo">IMF</span>
        <p class="muted">An illustrative, synthetic footer for the design-system demo — not affiliated with any real institution.</p>
        <div class="sf-social"><a href="#" aria-label="Link">${icon("link", { size: 16 })}</a><a href="#" aria-label="Email">${icon("mail", { size: 16 })}</a><a href="#" aria-label="Globe">${icon("globe", { size: 16 })}</a></div>
      </div>
      ${col("Data", ["World Economic Outlook", "IFS", "Balance of Payments", "DataMapper"])}
      ${col("Publications", ["Working Papers", "Country Reports", "Blogs", "Fiscal Monitor"])}
      ${col("About", ["Our work", "Research", "Careers", "Contact"])}
    </div>
    <div class="sf-legal"><span>© 2026 · Illustrative demo</span><nav aria-label="Legal"><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Accessibility</a><a href="#">Cookies</a></nav></div>
  </footer>`;
}

/** Slim legal / classification footer bar. */
function legalFooter(): string {
  return `<footer class="legal-footer">
    <span class="lf-note">${clsBadge("official")} This portal contains material for official use only.</span>
    <nav class="lf-links" aria-label="Legal"><a href="#">Data policy</a><a href="#">Disclaimer</a><a href="#">Contact</a></nav>
  </footer>`;
}

/** Fully composed app shell. */
function composedShell(): string {
  return frame(
    "app.imf.org",
    `<div class="shell">
      ${appHeader()}
      <div class="shell-body">
        ${enterpriseSidebar()}
        <div class="shell-content">
          <div class="page-header" style="margin-bottom:1rem"><nav class="crumb"><a href="#">Workspace</a> / <span class="cur">Overview</span></nav><div class="ph-row"><div><h2>Overview</h2><p class="muted">World Economic Outlook · Q3 2026</p></div><div class="ph-actions"><button class="btn btn-outline btn-sm">Export</button><button class="btn btn-primary btn-sm">New projection</button></div></div></div>
          <div class="kpi-strip"><div class="mini-kpi"><div class="l">World GDP growth</div><div class="v">3.2%</div></div><div class="mini-kpi"><div class="l">Inflation</div><div class="v">5.8%</div></div><div class="mini-kpi"><div class="l">Debt / GDP</div><div class="v">93.2%</div></div></div>
          <div class="card plot-card" data-chart="timeseries" data-title="Real GDP growth by region" style="margin-top:1rem"></div>
        </div>
      </div>
      ${appFooter()}
    </div>`,
  );
}

/** Build the app-shell section group. */
export function shellSections(): Section[] {
  return [
    {
      id: "header-two-level",
      group: "App shell",
      title: "Two-level enterprise header",
      desc: "A masthead with a utility bar (org switcher, locale, help, notifications, account) above the main navigation bar (brand, primary nav with a mega-menu, global search, and a primary action). Hover “Data” for the mega-menu.",
      html: demo(twoLevelHeader(), "col"),
    },
    {
      id: "header-variants",
      group: "App shell",
      title: "Header variants",
      desc: "Single-level application header (sidebar toggle, breadcrumb, tools), a marketing/site header, and a compact editing toolbar — the three header shapes enterprise apps reach for.",
      html: demo(`<div style="width:100%;display:flex;flex-direction:column;gap:1rem">${appHeader()}${siteHeader()}${compactHeader()}</div>`, "col"),
    },
    {
      id: "sidebar-enterprise",
      group: "App shell",
      title: "Sidebar — rail + grouped nav",
      desc: "The enterprise sidebar: a persistent icon rail, an expandable panel with grouped links and counts, an inline search, and a user card pinned to the bottom.",
      html: demo(`<div style="width:100%;height:440px">${enterpriseSidebar()}</div>`, "col"),
    },
    {
      id: "footer-app",
      group: "App shell",
      title: "Footers",
      desc: "Three footer shapes: an app status bar (health, version, environment), a multi-column marketing footer, and a slim legal/classification bar.",
      html: demo(`<div style="width:100%;display:flex;flex-direction:column;gap:1.1rem">${appFooter()}${siteFooter()}${legalFooter()}</div>`, "col"),
    },
    {
      id: "app-shell",
      group: "App shell",
      title: "Composed app shell",
      desc: "Header, sidebar rail + panel, content, and status footer assembled into the full application frame — the layout most screens live inside.",
      html: demo(composedShell(), "col"),
    },
  ];
}
