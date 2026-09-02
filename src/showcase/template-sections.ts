/**
 * IMF-flavored composite page templates (data explorer, country profile,
 * publication reader), rendered as framed previews. They compose the existing
 * components and charts, so they inherit the brand theme.
 */
import type { Section } from "./sections.js";

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
        <span class="flag">🇺🇸</span>
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

export function templateSections(): Section[] {
  return [
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
  ];
}
