#!/usr/bin/env node
/**
 * Build the shadcn registry items for this repo's extension components.
 *
 * Reads the component sources under registry/components/ and emits, per item,
 * a self-contained `registry/<name>.json` (installable directly with
 * `npx shadcn add <raw-url>`), plus a `registry.json` index for discovery /
 * `shadcn build`.
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

/** @typedef {{ name: string, title: string, description: string, source: string, dependencies?: string[], registryDependencies?: string[] }} ComponentDef */

/** @type {ComponentDef[]} */
const COMPONENTS = [
  {
    name: "sparkline",
    title: "Sparkline",
    description:
      "A tiny, dependency-free trend line that inherits the shadcn theme color (text-primary by default).",
    source: "components/ui/sparkline.tsx",
  },
  {
    name: "stat-card",
    title: "Stat Card",
    description:
      "A KPI tile with a headline value, trend delta, and an optional inline sparkline — colored entirely through shadcn theme tokens.",
    source: "components/ui/stat-card.tsx",
    registryDependencies: ["card", `${RAW_BASE}/sparkline.json`],
  },
];

/** Build a single registry item object from a component definition. */
async function buildItem(def) {
  const content = await readFile(join(REGISTRY_DIR, def.source), "utf8");
  const target = def.source; // components/ui/<name>.tsx
  return {
    $schema: ITEM_SCHEMA,
    name: def.name,
    type: "registry:component",
    title: def.title,
    description: def.description,
    ...(def.dependencies ? { dependencies: def.dependencies } : {}),
    ...(def.registryDependencies ? { registryDependencies: def.registryDependencies } : {}),
    files: [
      {
        path: target,
        type: "registry:component",
        target,
        content,
      },
    ],
  };
}

async function main() {
  const items = [];
  for (const def of COMPONENTS) {
    const item = await buildItem(def);
    items.push(item);
    const outPath = join(REGISTRY_DIR, `${def.name}.json`);
    await writeFile(outPath, `${JSON.stringify(item, null, 2)}\n`, "utf8");
    console.log(`✓ registry/${def.name}.json`);
  }

  // Index (without embedded file contents, to keep it readable).
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
