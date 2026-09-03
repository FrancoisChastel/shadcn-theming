#!/usr/bin/env node
/**
 * Build the shadcn registry items for this repo's extension components.
 *
 * Reads the sources under registry/components/ and emits, per item, a
 * self-contained `registry/<name>.json` (installable directly with
 * `npx shadcn add <raw-url>`), plus a `registry.json` index for discovery.
 */
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REGISTRY_DIR = join(ROOT, "registry");
const ITEM_SCHEMA = "https://ui.shadcn.com/schema/registry-item.json";
const REGISTRY_SCHEMA = "https://ui.shadcn.com/schema/registry.json";
const RAW_BASE =
  "https://raw.githubusercontent.com/FrancoisChastel/shadcn-theming/main/registry";

/** URL of a sibling registry item in this repo. */
const ref = (name) => `${RAW_BASE}/${name}.json`;

/**
 * @typedef {Object} ItemDef
 * @property {string} name
 * @property {"registry:component"|"registry:lib"|"registry:ui"} type
 * @property {string} title
 * @property {string} description
 * @property {string} source   path under registry/ to the source file
 * @property {string} target   install path in the consumer project
 * @property {string[]} [dependencies]
 * @property {string[]} [registryDependencies]
 */

/** @type {ItemDef[]} */
const ITEMS = [
  {
    name: "stats",
    type: "registry:lib",
    title: "Statistics helpers",
    description:
      "Dependency-free statistics helpers (KDE bandwidth + Gaussian KDE, Pearson correlation matrix) used by the scientific charts.",
    source: "components/lib/stats.ts",
    target: "lib/stats.ts",
  },
  {
    name: "use-plot",
    type: "registry:lib",
    title: "usePlot hook",
    description:
      "A React hook that renders an Observable Plot figure into a container and keeps it sized responsively.",
    source: "components/lib/use-plot.ts",
    target: "lib/use-plot.ts",
  },
  {
    name: "icon",
    type: "registry:component",
    title: "Icon",
    description:
      "A zero-dependency <Icon> component with 79 Lucide-style stroke icons that inherit currentColor — the exact set used across the design system. Decorative by default; pass aria-label to expose it.",
    source: "components/ui/icon.tsx",
    target: "components/ui/icon.tsx",
  },
  {
    name: "sparkline",
    type: "registry:component",
    title: "Sparkline",
    description:
      "A tiny, dependency-free trend line that inherits the shadcn theme color (text-primary by default).",
    source: "components/ui/sparkline.tsx",
    target: "components/ui/sparkline.tsx",
  },
  {
    name: "stat-card",
    type: "registry:component",
    title: "Stat Card",
    description:
      "A KPI tile with a headline value, trend delta, and an optional inline sparkline — colored entirely through shadcn theme tokens.",
    source: "components/ui/stat-card.tsx",
    target: "components/ui/stat-card.tsx",
    registryDependencies: ["card", ref("sparkline")],
  },
  {
    name: "histogram",
    type: "registry:component",
    title: "Histogram",
    description:
      "A distribution plot: histogram with an optional Gaussian KDE overlay (seaborn histplot), rendered with Observable Plot.",
    source: "components/ui/histogram.tsx",
    target: "components/ui/histogram.tsx",
    dependencies: ["@observablehq/plot"],
    registryDependencies: [ref("use-plot"), ref("stats")],
  },
  {
    name: "box-plot",
    type: "registry:component",
    title: "Box Plot",
    description:
      "Grouped Tukey box plots (Observable Plot boxY) with whiskers and outliers, cycling the chart palette. seaborn boxplot.",
    source: "components/ui/box-plot.tsx",
    target: "components/ui/box-plot.tsx",
    dependencies: ["@observablehq/plot"],
    registryDependencies: [ref("use-plot")],
  },
  {
    name: "scatter-plot",
    type: "registry:component",
    title: "Scatter Plot",
    description:
      "A scatter plot with an OLS regression line and 95% confidence band (Observable Plot linearRegressionY). seaborn regplot.",
    source: "components/ui/scatter-plot.tsx",
    target: "components/ui/scatter-plot.tsx",
    dependencies: ["@observablehq/plot"],
    registryDependencies: [ref("use-plot")],
  },
  {
    name: "area-band",
    type: "registry:component",
    title: "Area Band",
    description:
      "A line with a shaded confidence/projection band and dashed forecast — the IMF WEO fan-chart idiom (Observable Plot).",
    source: "components/ui/area-band.tsx",
    target: "components/ui/area-band.tsx",
    dependencies: ["@observablehq/plot"],
    registryDependencies: [ref("use-plot")],
  },
  {
    name: "correlation-heatmap",
    type: "registry:component",
    title: "Correlation Heatmap",
    description:
      "A correlation matrix heatmap (Observable Plot cell) with a theme-derived diverging color scale. seaborn heatmap.",
    source: "components/ui/correlation-heatmap.tsx",
    target: "components/ui/correlation-heatmap.tsx",
    dependencies: ["@observablehq/plot"],
    registryDependencies: [ref("use-plot"), ref("stats")],
  },
  {
    name: "line-chart",
    type: "registry:component",
    title: "Line Chart",
    description: "A multi-series line / time-series chart (Observable Plot) with a theme-colored legend.",
    source: "components/ui/line-chart.tsx",
    target: "components/ui/line-chart.tsx",
    dependencies: ["@observablehq/plot"],
    registryDependencies: [ref("use-plot")],
  },
  {
    name: "bar-chart",
    type: "registry:component",
    title: "Bar Chart",
    description: "A grouped or stacked bar chart (Observable Plot), prop-driven, with a legend.",
    source: "components/ui/bar-chart.tsx",
    target: "components/ui/bar-chart.tsx",
    dependencies: ["@observablehq/plot"],
    registryDependencies: [ref("use-plot")],
  },
  {
    name: "bullet-chart",
    type: "registry:component",
    title: "Bullet Chart",
    description: "A KPI-vs-target bullet chart (Observable Plot): track, actual bar, and target tick per row.",
    source: "components/ui/bullet-chart.tsx",
    target: "components/ui/bullet-chart.tsx",
    dependencies: ["@observablehq/plot"],
    registryDependencies: [ref("use-plot")],
  },
  {
    name: "donut-chart",
    type: "registry:component",
    title: "Donut Chart",
    description: "A donut chart (d3-shape) with a legend and center label, colored from the chart palette.",
    source: "components/ui/donut-chart.tsx",
    target: "components/ui/donut-chart.tsx",
    dependencies: ["d3-shape"],
  },
  {
    name: "fan-chart",
    type: "registry:component",
    title: "Fan Chart",
    description:
      "A probabilistic fan chart: a median path with nested 50/80/90% projection bands that widen into the forecast horizon (Observable Plot). The IMF WEO forecast idiom.",
    source: "components/ui/fan-chart.tsx",
    target: "components/ui/fan-chart.tsx",
    dependencies: ["@observablehq/plot"],
    registryDependencies: [ref("use-plot")],
  },
  {
    name: "waterfall-chart",
    type: "registry:component",
    title: "Waterfall Chart",
    description:
      "A waterfall chart: signed contributions stacked cumulatively to a total — growth decompositions, budget bridges, variance analysis (Observable Plot).",
    source: "components/ui/waterfall-chart.tsx",
    target: "components/ui/waterfall-chart.tsx",
    dependencies: ["@observablehq/plot"],
    registryDependencies: [ref("use-plot")],
  },
  {
    name: "slope-chart",
    type: "registry:component",
    title: "Slope Chart",
    description: "A slopegraph: two aligned axes connected per item — how a ranking or level shifts between two periods (Observable Plot).",
    source: "components/ui/slope-chart.tsx",
    target: "components/ui/slope-chart.tsx",
    dependencies: ["@observablehq/plot"],
    registryDependencies: [ref("use-plot")],
  },
  {
    name: "connected-scatter",
    type: "registry:component",
    title: "Connected Scatter",
    description: "A connected scatter: points joined in sequence with an arrowed path — a trajectory through a 2-D space over time (Observable Plot).",
    source: "components/ui/connected-scatter.tsx",
    target: "components/ui/connected-scatter.tsx",
    dependencies: ["@observablehq/plot"],
    registryDependencies: [ref("use-plot")],
  },
  {
    name: "ecdf-plot",
    type: "registry:component",
    title: "ECDF Plot",
    description: "An empirical cumulative distribution function — a step curve of the share of observations at or below each value. seaborn ecdfplot.",
    source: "components/ui/ecdf-plot.tsx",
    target: "components/ui/ecdf-plot.tsx",
    dependencies: ["@observablehq/plot"],
    registryDependencies: [ref("use-plot")],
  },
  {
    name: "lorenz-curve",
    type: "registry:component",
    title: "Lorenz Curve",
    description: "A Lorenz curve with the line of equality and the computed Gini coefficient — the standard picture of income or wealth inequality (Observable Plot).",
    source: "components/ui/lorenz-curve.tsx",
    target: "components/ui/lorenz-curve.tsx",
    dependencies: ["@observablehq/plot"],
    registryDependencies: [ref("use-plot")],
  },
  {
    name: "candlestick-chart",
    type: "registry:component",
    title: "Candlestick Chart",
    description: "A candlestick (OHLC) chart: a wick from low to high with an open→close body, colored by direction — prices, rates, and yields (Observable Plot).",
    source: "components/ui/candlestick-chart.tsx",
    target: "components/ui/candlestick-chart.tsx",
    dependencies: ["@observablehq/plot"],
    registryDependencies: [ref("use-plot")],
  },
  {
    name: "radar-chart",
    type: "registry:component",
    title: "Radar Chart",
    description: "A dependency-free SVG radar (spider) chart for comparing a handful of normalized metrics across one or more series. Colored from theme tokens.",
    source: "components/ui/radar-chart.tsx",
    target: "components/ui/radar-chart.tsx",
  },
  {
    name: "classification-badge",
    type: "registry:component",
    title: "Classification Badge",
    description:
      "Document-confidentiality UI — the four levels (Public → For Official Use Only → Confidential → Strictly Confidential) as color-coded shield badges plus a full-width banner. Dependency-free, theme-token colored.",
    source: "components/ui/classification-badge.tsx",
    target: "components/ui/classification-badge.tsx",
  },
  {
    name: "data-table",
    type: "registry:component",
    title: "Data Table",
    description:
      "A lightweight, dependency-free data table: sortable columns, filter, pagination, and row selection. Theme-token styled.",
    source: "components/ui/data-table.tsx",
    target: "components/ui/data-table.tsx",
  },
];

/** Build a single registry item object from a definition. */
async function buildItem(def) {
  const content = await readFile(join(REGISTRY_DIR, def.source), "utf8");
  const fileType = def.type === "registry:lib" ? "registry:lib" : "registry:component";
  return {
    $schema: ITEM_SCHEMA,
    name: def.name,
    type: def.type,
    title: def.title,
    description: def.description,
    ...(def.dependencies ? { dependencies: def.dependencies } : {}),
    ...(def.registryDependencies ? { registryDependencies: def.registryDependencies } : {}),
    files: [{ path: def.target, type: fileType, target: def.target, content }],
  };
}

async function main() {
  const items = [];
  for (const def of ITEMS) {
    const item = await buildItem(def);
    items.push(item);
    await writeFile(
      join(REGISTRY_DIR, `${def.name}.json`),
      `${JSON.stringify(item, null, 2)}\n`,
      "utf8",
    );
    console.log(`✓ registry/${def.name}.json`);
  }

  const index = {
    $schema: REGISTRY_SCHEMA,
    name: "shadcn-theming",
    homepage: "https://github.com/FrancoisChastel/shadcn-theming",
    items: items.map(({ files, ...rest }) => ({
      ...rest,
      files: files.map(({ content, ...f }) => f),
    })),
  };
  await writeFile(join(REGISTRY_DIR, "registry.json"), `${JSON.stringify(index, null, 2)}\n`, "utf8");
  console.log("✓ registry/registry.json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
