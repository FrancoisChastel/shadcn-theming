/**
 * Deterministic, IMF-flavored sample datasets for the showcase. A seeded PRNG
 * keeps the generated page byte-stable across runs (important for diffing and
 * for avoiding `Math.random` nondeterminism).
 *
 * The numbers are illustrative and synthetic — shaped to look like WEO-style
 * macro indicators, not sourced from actual IMF data.
 */

/** mulberry32 — tiny deterministic PRNG. */
function prng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Standard normal via Box–Muller, driven by the seeded PRNG. */
function normal(rand: () => number, mean: number, sd: number): number {
  const u1 = Math.max(rand(), 1e-9);
  const u2 = rand();
  return mean + sd * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

const rand = prng(0x1f2e3d4c);

export interface WeoPoint {
  x: number;
  y: number;
  lower?: number;
  upper?: number;
  forecast?: boolean;
}

/** World real GDP growth (%), history + a widening projection fan. */
export const gdpProjection: WeoPoint[] = (() => {
  const history: Array<[number, number]> = [
    [2015, 3.4],
    [2016, 3.3],
    [2017, 3.8],
    [2018, 3.6],
    [2019, 2.8],
    [2020, -2.7],
    [2021, 6.5],
    [2022, 3.6],
    [2023, 3.3],
    [2024, 3.2],
  ];
  const points: WeoPoint[] = history.map(([x, y]) => ({ x, y }));
  let last = 3.2;
  for (let i = 1; i <= 5; i++) {
    const year = 2024 + i;
    last = last + normal(rand, 0.02, 0.25);
    const spread = 0.35 * i;
    points.push({ x: year, y: Number(last.toFixed(2)), lower: Number((last - spread).toFixed(2)), upper: Number((last + spread).toFixed(2)), forecast: true });
  }
  return points;
})();

/** Distribution of country-level growth rates (%) for a histogram + KDE. */
export const growthDistribution: number[] = Array.from({ length: 190 }, () =>
  Number(normal(rand, 3.1, 2.4).toFixed(2)),
);

/** Phillips-curve style scatter: unemployment (%) vs inflation (%). */
export const phillips: Array<{ x: number; y: number }> = Array.from({ length: 80 }, () => {
  const unemployment = 3 + rand() * 9;
  const inflation = 9.5 - 0.7 * unemployment + normal(rand, 0, 1.1);
  return { x: Number(unemployment.toFixed(2)), y: Number(inflation.toFixed(2)) };
});

/** Regional growth samples (%) for grouped box plots. */
export const regionalGrowth: Array<{ label: string; values: number[] }> = [
  { label: "Adv. econ.", mean: 1.8, sd: 1.0 },
  { label: "Emerging", mean: 4.2, sd: 1.8 },
  { label: "Low-income", mean: 5.0, sd: 2.6 },
  { label: "Euro area", mean: 1.2, sd: 1.1 },
  { label: "ASEAN-5", mean: 4.6, sd: 1.3 },
].map((g) => ({
  label: g.label,
  values: Array.from({ length: 40 }, () => Number(normal(rand, g.mean, g.sd).toFixed(2))),
}));

/** Macro indicators for a correlation heatmap. */
export const macroLabels = ["GDP growth", "Inflation", "Unemployment", "Gov. debt", "Curr. acct"];
export const macroColumns: number[][] = (() => {
  const n = 60;
  const gdp = Array.from({ length: n }, () => normal(rand, 3, 2));
  const inflation = gdp.map((g) => -0.4 * g + normal(rand, 4, 1.5));
  const unemployment = gdp.map((g) => -0.6 * g + normal(rand, 7, 1.2));
  const debt = gdp.map((g) => -0.5 * g + normal(rand, 60, 15));
  const currentAcct = gdp.map((g) => 0.3 * g + normal(rand, 0, 2));
  return [gdp, inflation, unemployment, debt, currentAcct];
})();

export interface Kpi {
  label: string;
  value: string;
  delta: number;
  deltaLabel: string;
  data: number[];
}

/** Multi-line time series: real GDP growth (%) by region, 2015–2029. */
export const regionSeries: Array<{ region: string; points: Array<{ year: number; value: number }> }> = (() => {
  const regions = [
    { region: "Advanced", base: 1.8, sd: 0.6 },
    { region: "Emerging", base: 4.4, sd: 0.9 },
    { region: "Low-income", base: 5.0, sd: 1.1 },
  ];
  return regions.map((r) => ({
    region: r.region,
    points: Array.from({ length: 15 }, (_, i) => {
      const year = 2015 + i;
      const shock = year === 2020 ? -6 : 0;
      return { year, value: Number((r.base + shock + normal(rand, 0, r.sd)).toFixed(2)) };
    }),
  }));
})();

/** Grouped/stacked bars: indicator values (%) by region. */
export const groupedBars: Array<{ region: string; series: string; value: number }> = (() => {
  const regions = ["Advanced", "Euro area", "Emerging", "ASEAN-5", "Low-income"];
  const series: Array<[string, number, number]> = [
    ["GDP growth", 3, 1.5],
    ["Inflation", 4.5, 1.2],
    ["Unemployment", 6, 1.4],
  ];
  return regions.flatMap((region) =>
    series.map(([s, mean, sd]) => ({ region, series: s, value: Number(Math.max(0, normal(rand, mean, sd)).toFixed(1)) })),
  );
})();

/** Diverging bars: current-account balance (% of GDP) by country. */
export const divergingCA: Array<{ country: string; value: number }> = [
  "Germany", "Japan", "China", "Korea", "Brazil", "India", "USA", "UK", "Turkey",
].map((country) => ({ country, value: Number(normal(rand, 0, 3.2).toFixed(1)) }))
  .sort((a, b) => b.value - a.value);

/** Donut composition: allocated reserves by currency (%). */
export const donutParts: Array<{ label: string; value: number }> = [
  { label: "USD", value: 58 },
  { label: "EUR", value: 20 },
  { label: "JPY", value: 6 },
  { label: "GBP", value: 5 },
  { label: "CNY", value: 3 },
  { label: "Other", value: 8 },
];

/** Bullet KPIs: actual vs target. */
export const bulletKpis: Array<{ label: string; value: number; target: number; max: number; unit: string }> = [
  { label: "Growth", value: 3.2, target: 3.0, max: 6, unit: "%" },
  { label: "Inflation", value: 5.8, target: 4.0, max: 10, unit: "%" },
  { label: "Reserves cover", value: 7.4, target: 6.0, max: 12, unit: "mo" },
];

/** Headline KPI tiles. */
export const kpis: Kpi[] = [
  { label: "World GDP growth", value: "3.2%", delta: 0.1, deltaLabel: "vs WEO Apr", data: [3.6, 3.3, 2.8, -2.7, 6.5, 3.6, 3.3, 3.2] },
  { label: "Global inflation", value: "5.8%", delta: -1.2, deltaLabel: "yoy", data: [3.2, 3.5, 4.7, 8.7, 6.9, 5.8] },
  { label: "Public debt / GDP", value: "93.2%", delta: 1.6, deltaLabel: "vs 2023", data: [84, 88, 99, 96, 94, 93] },
  { label: "Trade volume", value: "+3.4%", delta: 2.1, deltaLabel: "yoy", data: [1.0, 0.8, 5.5, 5.1, 0.9, 3.4] },
];
