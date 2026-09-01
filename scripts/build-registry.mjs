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
