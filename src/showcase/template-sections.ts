/**
 * IMF-flavored composite page templates (data explorer, country profile,
 * publication reader), rendered as framed previews. They compose the existing
 * components and charts, so they inherit the brand theme.
 */
import type { Section } from "./sections.js";
import { icon } from "./icons.js";
import { clsBadge, clsBanner } from "./classification.js";

const demo = (inner: string) => `<div class="demo col">${inner}</div>`;
const frame = (url: string, inner: string) =>
  `<div class="block-frame"><div class="block-bar"><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="url">${url}</span></div><div class="block-stage" style="padding:0;display:block">${inner}</div></div>`;

const chev = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>';

function miniKpi(label: string, value: string, delta: string, up: boolean): string {
  return `<div class="mini-kpi"><div class="l">${label}</div><div class="v">${value}</div><div class="d" style="color:${up ? "var(--chart-5)" : "var(--destructive)"}">${up ? "▲" : "▼"} ${delta}</div></div>`;
}

function dataExplorer(): string {
  const rows = [
    ["United States", "2.8", "3.1", "121"],
    ["China", "5.0", "0.7", "83"],
    ["Japan", "1.9", "2.8", "252"],
    ["Germany", "0.2", "2.9", "64"],
  ];
  return frame(
    "imf.org/datamapper",
    `<div class="explorer">
      <div class="ex-filters">
        <div><div class="label">Indicator</div><button class="combobox-trigger" data-menu-trigger style="max-width:none">Real GDP growth ${chev}</button></div>
        <div><div class="label">Regions</div>
          <label class="check-line"><input type="checkbox" checked /> Advanced</label>
          <label class="check-line"><input type="checkbox" checked /> Emerging</label>
          <label class="check-line"><input type="checkbox" /> Low-income</label>
        </div>
        <div><div class="label">From</div><input class="input" value="2015" aria-label="From year" /></div>
        <div><div class="label">To</div><input class="input" value="2029" aria-label="To year" /></div>
        <button class="btn btn-primary" style="margin-top:auto">Apply</button>
      </div>
      <div class="ex-main">
        <div class="ex-head"><h3>Real GDP growth</h3>
          <div data-tabs><div class="tabs-list"><button data-tab="c" aria-selected="true">Chart</button><button data-tab="t" aria-selected="false">Table</button><button data-tab="m" aria-selected="false">Map</button></div></div>
        </div>
        <div class="card plot-card" data-chart="timeseries" data-title="Real GDP growth by region"></div>
        <table class="tbl"><thead><tr><th>Country</th><th class="num">2024</th><th class="num">Inflation</th><th class="num">Debt/GDP</th></tr></thead>
          <tbody>${rows.map((r) => `<tr><td>${r[0]}</td><td class="num">${r[1]}</td><td class="num">${r[2]}</td><td class="num">${r[3]}</td></tr>`).join("")}</tbody></table>
      </div>
    </div>`,
  );
}

function countryProfile(): string {
  return frame(
    "imf.org/countries/USA",
    `<div class="country">
      <div class="country-head">
        <span class="flag">${icon("globe", { size: 22 })}</span>
        <div style="flex:1"><h3>United States</h3><div class="muted" style="font-size:.82rem">Article IV · Advanced economy</div></div>
        <span class="badge badge-secondary">G7</span><span class="badge badge-outline">SDR 82.99bn quota</span>
        <button class="btn btn-outline btn-sm">Download data</button>
      </div>
      <div class="country-body">
        <div class="kpi-row">
          ${miniKpi("GDP growth", "2.8%", "0.3", true)}
          ${miniKpi("Inflation", "3.1%", "0.6", false)}
          ${miniKpi("Unemployment", "4.1%", "0.2", true)}
          ${miniKpi("Gov. debt / GDP", "121%", "2.4", false)}
        </div>
        <div class="grid2">
          <div class="card plot-card" data-chart="areaband" data-title="GDP growth — projection"></div>
          <div class="card plot-card" data-chart="bullet" data-title="Targets vs actuals"></div>
        </div>
        <table class="tbl"><caption>Selected indicators (WEO)</caption>
          <thead><tr><th>Indicator</th><th class="num">2023</th><th class="num">2024</th><th class="num">2025F</th></tr></thead>
          <tbody>
            <tr><td>Real GDP growth (%)</td><td class="num">2.5</td><td class="num">2.8</td><td class="num">2.2</td></tr>
            <tr><td>Inflation, avg (%)</td><td class="num">4.1</td><td class="num">3.1</td><td class="num">2.4</td></tr>
            <tr><td>Current account (% GDP)</td><td class="num">-3.0</td><td class="num">-3.3</td><td class="num">-3.1</td></tr>
            <tr><td>Gross public debt (% GDP)</td><td class="num">118</td><td class="num">121</td><td class="num">124</td></tr>
          </tbody></table>
      </div>
    </div>`,
  );
}

function publicationReader(): string {
  return frame(
    "imf.org/publications/weo",
    `<div class="reader">
      <aside class="reader-toc">
        <div class="toc-title">On this page</div>
        <a href="#" class="active">Overview</a><a href="#">Global outlook</a><a href="#">Risks</a><a href="#">Policy</a>
      </aside>
      <article class="reader-body">
        <div style="margin-bottom:1rem">${clsBanner("official")}</div>
        <div class="eyebrow">World Economic Outlook</div>
        <h1>Global growth holds steady amid uneven disinflation</h1>
        <div class="meta">October 2026 · IMF Research Department · 12 min read</div>
        <p>Global activity is projected to expand 3.2 percent in 2025, broadly unchanged from the April forecast, as disinflation continues across most economies and financial conditions ease gradually.</p>
        <h2 id="global">Global outlook</h2>
        <p>Advanced economies are expected to grow 1.8 percent, while emerging market and developing economies expand a firmer 4.2 percent. Divergence across regions remains a defining feature of the outlook.</p>
        <figure class="fig"><div class="card plot-card" data-chart="areaband" data-title="World GDP growth — WEO projection"></div><figcaption>Figure 1. World real GDP growth, with the October projection band. Source: IMF staff estimates.</figcaption></figure>
        <p>Inflation is forecast to ease toward central-bank targets, though services prices remain sticky in several advanced economies.</p>
        <h2 id="risks">Risks</h2>
        <p>Risks to the outlook are broadly balanced. On the downside, renewed commodity-price volatility and tighter-for-longer financial conditions could weigh on growth.</p>
        <div class="footnotes">
          <p>1. Projections assume unchanged policies and are subject to considerable uncertainty.</p>
          <p>2. Regional aggregates are PPP-GDP weighted. See the Statistical Appendix for group definitions.</p>
        </div>
      </article>
    </div>`,
  );
}

const sysHead = (title: string, right: string) =>
  `<div class="ex-head" style="padding:1rem 1.25rem;border-bottom:1px solid var(--border)"><h3>${title}</h3><div style="display:flex;gap:.5rem;align-items:center">${right}</div></div>`;

function dashboard(): string {
  return frame(
    "app.imf.org/dashboard",
    `<div class="country">
      ${sysHead("Overview", `<button class="btn btn-outline btn-sm" style="display:inline-flex;align-items:center;gap:.35rem">Last 12 months ${icon("chevron-down", { size: 14 })}</button><button class="btn btn-primary btn-sm">Export</button>`)}
      <div class="sys-body">
        <div class="kpi-row">${miniKpi("World GDP growth", "3.2%", "0.1", true)}${miniKpi("Inflation", "5.8%", "1.2", false)}${miniKpi("Debt / GDP", "93.2%", "1.6", false)}${miniKpi("Trade", "+3.4%", "2.1", true)}</div>
        <div class="grid2"><div class="card plot-card" data-chart="timeseries" data-title="Growth by region"></div><div class="card plot-card" data-chart="donut" data-title="Reserves by currency"></div></div>
        <table class="tbl"><caption>Recent releases</caption><thead><tr><th>Report</th><th>Date</th><th class="num">Downloads</th></tr></thead>
          <tbody><tr><td>World Economic Outlook</td><td>Oct 2026</td><td class="num">48,201</td></tr><tr><td>Global Financial Stability</td><td>Oct 2026</td><td class="num">21,940</td></tr><tr><td>Fiscal Monitor</td><td>Oct 2026</td><td class="num">18,320</td></tr></tbody></table>
      </div>
    </div>`,
  );
}

function searchResults(): string {
  const results: Array<[string, string, string]> = [
    ["World Economic Outlook, October 2026", "Global growth is projected to hold at 3.2% in 2025 as disinflation continues…", "Publication · imf.org/weo"],
    ["Inflation dynamics in emerging markets", "Services prices remain sticky while goods disinflation broadens across…", "Working Paper · WP/26/184"],
    ["Consumer prices (annual %)", "Time series across 190 economies, 1980–2029, with projections.", "Data · DataMapper"],
    ["Why is inflation easing unevenly?", "A look at the cross-country dispersion in the pace of disinflation.", "Blog · 12 Sep 2026"],
  ];
  return frame(
    "app.imf.org/search?q=inflation",
    `<div class="country">
      ${sysHead("", `<div class="input-icon" data-search style="max-width:360px;flex:1"><span class="lead" aria-hidden="true">${icon("search", { size: 15 })}</span><input class="input" value="inflation outlook" aria-label="Search" /><button class="clear" data-search-clear aria-label="clear">×</button></div>`)}
      <div class="sys-body">
        <div class="filter-chips"><span class="fc on">All</span><span class="fc">Publications</span><span class="fc">Data</span><span class="fc">Blogs</span><span class="fc">Countries</span></div>
        <span class="muted" style="font-size:.8rem">About 1,240 results</span>
        <div class="sresult">${results.map((r) => `<div class="sr"><div class="ttl">${r[0]}</div><div class="snip">${r[1]}</div><div class="m">${r[2]}</div></div>`).join("")}</div>
      </div>
    </div>`,
  );
}

function notifications(): string {
  const items: Array<[string, string, string, boolean]> = [
    [icon("bar-chart", { size: 16 }), "WEO October data is now available", "2h ago", true],
    [icon("message", { size: 16 }), "New comment on your growth projection", "5h ago", true],
    [icon("check-circle", { size: 16 }), "Your CSV export completed", "Yesterday", false],
    [icon("bell", { size: 16 }), "Fiscal Monitor was published", "2 days ago", false],
  ];
  return frame(
    "app.imf.org/notifications",
    `<div class="country">
      ${sysHead("Notifications", `<button class="btn btn-ghost btn-sm">Mark all read</button>`)}
      <div class="sys-body"><div class="notif">${items
        .map(
          (i) =>
            `<div class="ni"><span class="nico" aria-hidden="true">${i[0]}</span><div style="flex:1"><div style="font-size:.88rem">${i[1]}</div><div class="nt">${i[2]}</div></div>${i[3] ? '<span class="dot"></span>' : ""}</div>`,
        )
        .join("")}</div></div>
    </div>`,
  );
}

function settings(): string {
  const sessions: Array<[string, string, string, boolean]> = [
    ["MacBook Pro · Chrome", "Washington, DC", "Active now", true],
    ["iPhone 15 · Safari", "Washington, DC", "2 hours ago", false],
    ["Windows · Edge", "London, UK", "3 days ago", false],
  ];
  return frame(
    "app.imf.org/settings/security",
    `<div class="settings-layout">
      <nav class="settings-nav">
        <a>${icon("user", { size: 15 })} Profile</a>
        <a>${icon("building", { size: 15 })} Account</a>
        <a class="active">${icon("shield", { size: 15 })} Security</a>
        <a>${icon("bell", { size: 15 })} Notifications</a>
        <a>${icon("sun", { size: 15 })} Appearance</a>
        <a>${icon("key", { size: 15 })} API tokens</a>
      </nav>
      <div>
        <h3 style="margin:0 0 .25rem">Security &amp; access</h3><p class="muted" style="font-size:.83rem;margin:0 0 1.25rem">Protect your account and set how the documents you create are handled.</p>

        <div class="set-card">
          <div class="set-row"><div><b>Two-factor authentication</b><p class="muted">Require a one-time code at sign-in.</p></div><label class="switch"><input type="checkbox" checked /><span class="track"><span class="thumb"></span></span></label></div>
          <div class="set-row"><div><b>Passkeys</b><p class="muted">Sign in with Face ID, Touch ID, or a security key.</p></div><button class="btn btn-outline btn-sm">Add passkey</button></div>
        </div>

        <div class="set-card">
          <div class="set-row"><div><b>Default document classification</b><p class="muted">Applied to new documents you create.</p></div>
            <div class="cls-select" data-cls-picker><button class="select-trigger" data-menu-trigger aria-haspopup="listbox" style="width:auto">${clsBadge("official")} ${icon("chevron-down", { size: 15 })}</button>
              <div data-menu role="listbox"><div class="menu-item" role="option" data-cls-option data-cls="public">${clsBadge("public")}</div><div class="menu-item" role="option" data-cls-option data-cls="official">${clsBadge("official")}</div><div class="menu-item" role="option" data-cls-option data-cls="confidential">${clsBadge("confidential")}</div><div class="menu-item" role="option" data-cls-option data-cls="strict">${clsBadge("strict")}</div></div>
            </div>
          </div>
        </div>

        <div class="set-card">
          <div class="set-card-head"><b>Active sessions</b><button class="btn btn-ghost btn-sm">Sign out all</button></div>
          ${sessions
            .map(
              ([dev, loc, when, cur]) =>
                `<div class="session-row"><span class="s-ico">${icon("lock-keyhole", { size: 15 })}</span><div style="flex:1"><div style="font-size:.86rem">${dev}${cur ? ' <span class="badge badge-secondary">This device</span>' : ""}</div><div class="muted" style="font-size:.74rem">${loc} · ${when}</div></div>${cur ? "" : '<button class="btn btn-ghost btn-sm">Revoke</button>'}</div>`,
            )
            .join("")}
        </div>

        <div style="display:flex;gap:.5rem"><button class="btn btn-ghost btn-sm">Cancel</button><button class="btn btn-primary btn-sm">Save changes</button></div>
      </div>
    </div>`,
  );
}

function profilePage(): string {
  const docs: Array<[string, string, string]> = [
    ["World Economic Outlook — draft", "official", "Updated 2h ago"],
    ["Disinflation dynamics (WP/26/184)", "strict", "Updated yesterday"],
    ["Reserves adequacy note", "confidential", "Updated 3 days ago"],
    ["Growth data explainer (blog)", "public", "Published 12 Sep"],
  ];
  const activity: Array<[string, string, string]> = [
    ["edit", "Revised the 2025 growth projection", "2h ago"],
    ["file-text", "Published the WEO summary", "5h ago"],
    ["message", "Commented on the fan-chart band", "Yesterday"],
    ["upload", "Uploaded reserves_2026.csv", "2 days ago"],
  ];
  return frame(
    "app.imf.org/u/fchastel",
    `<div class="profile">
      <div class="profile-cover"></div>
      <div class="profile-head">
        <span class="profile-avatar">FC</span>
        <div class="profile-id">
          <h2>Francois Chastel</h2>
          <div class="muted" style="font-size:.85rem">Economist · Research Department</div>
          <div class="profile-badges"><span class="badge badge-secondary">${icon("building", { size: 12 })} IMF</span><span class="badge badge-outline">Washington, DC</span><span class="badge badge-outline">${icon("badge-check", { size: 12 })} Verified</span></div>
        </div>
        <div class="profile-actions"><button class="btn btn-outline btn-sm">${icon("mail", { size: 14 })} Message</button><button class="btn btn-primary btn-sm">Edit profile</button></div>
      </div>
      <div class="profile-stats">
        ${miniKpi("Publications", "48", "6", true)}
        ${miniKpi("Datasets", "23", "2", true)}
        ${miniKpi("Citations", "1,204", "18", true)}
        ${miniKpi("Followers", "312", "9", true)}
      </div>
      <div data-tabs class="profile-tabs"><div class="tabs-list"><button data-tab="o" aria-selected="true">Overview</button><button data-tab="d" aria-selected="false">Documents</button><button data-tab="a" aria-selected="false">Activity</button></div></div>
      <div class="profile-body">
        <div class="profile-main">
          <div class="card" style="padding:1.1rem"><h4 style="margin:0 0 .5rem">About</h4><p class="muted" style="font-size:.86rem;margin:0">Macro-fiscal economist focused on projections, disinflation dynamics, and reserve adequacy. Maintains the WEO growth series and the fan-chart methodology.</p></div>
          <div class="card" style="padding:1.1rem;margin-top:1rem"><div class="set-card-head" style="margin-bottom:.5rem"><h4 style="margin:0">Recent documents</h4><a href="#" class="muted" style="font-size:.78rem">View all</a></div>
            ${docs.map(([t, cls, when]) => `<div class="doc-row"><span class="s-ico">${icon("file-text", { size: 15 })}</span><div style="flex:1"><div style="font-size:.85rem">${t}</div><div class="muted" style="font-size:.73rem">${when}</div></div>${clsBadge(cls)}</div>`).join("")}
          </div>
        </div>
        <aside class="profile-aside">
          <div class="card" style="padding:1.1rem"><h4 style="margin:0 0 .6rem">Contact</h4>
            <div class="contact-row">${icon("mail", { size: 14 })} francois@imf.org</div>
            <div class="contact-row">${icon("briefcase", { size: 14 })} Research Department</div>
            <div class="contact-row">${icon("globe", { size: 14 })} imf.org/fchastel</div>
          </div>
          <div class="card" style="padding:1.1rem;margin-top:1rem"><h4 style="margin:0 0 .6rem">Activity</h4>
            <div class="feed">${activity.map(([ic, t, when]) => `<div class="feed-row"><span class="feed-ico">${icon(ic, { size: 13 })}</span><div><div style="font-size:.82rem">${t}</div><div class="muted" style="font-size:.72rem">${when}</div></div></div>`).join("")}</div>
          </div>
        </aside>
      </div>
    </div>`,
  );
}

export function templateSections(): Section[] {
  return [
    {
      id: "tpl-dashboard",
      group: "Templates",
      title: "Dashboard",
      desc: "An analytics home: header, KPI row, charts, and a recent-releases table.",
      html: demo(dashboard()),
    },
    {
      id: "tpl-data-explorer",
      group: "Templates",
      title: "Data explorer",
      desc: "A DataMapper-style page: a filter panel, a chart/table/map switcher, and a results table.",
      html: demo(dataExplorer()),
    },
    {
      id: "tpl-country-profile",
      group: "Templates",
      title: "Country profile",
      desc: "A member-country page: header, KPI row, projection + target charts, and an indicator table.",
      html: demo(countryProfile()),
    },
    {
      id: "tpl-publication",
      group: "Templates",
      title: "Publication reader",
      desc: "A WEO-style report reader: on-this-page nav, prose, a captioned figure, and footnotes.",
      html: demo(publicationReader()),
    },
    {
      id: "tpl-search",
      group: "Templates",
      title: "Search results",
      desc: "A results page with a query bar, filter chips, and a result list.",
      html: demo(searchResults()),
    },
    {
      id: "tpl-notifications",
      group: "Templates",
      title: "Notifications",
      desc: "A notification center with read/unread items.",
      html: demo(notifications()),
    },
    {
      id: "tpl-profile",
      group: "Templates",
      title: "Profile",
      desc: "A user profile page: cover, avatar, stat row, tabs, an about + recent-documents column (with classification badges), and a contact + activity aside.",
      html: demo(profilePage()),
    },
    {
      id: "tpl-settings",
      group: "Templates",
      title: "Settings",
      desc: "A multi-section settings page — Security shown: two-factor, passkeys, default document classification, and active sessions.",
      html: demo(settings()),
    },
  ];
}
