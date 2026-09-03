#!/usr/bin/env node
/**
 * Generate src/showcase/guide-content.ts from the canonical Markdown docs
 * (AGENTS.md, the design-system Agent Skill, CONTRIBUTING.md) so the "Develop"
 * page embeds the exact same text that ships in the repo — no drift.
 *
 * The .md files are the source of truth; the .ts export is derived.
 */
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "src/showcase/guide-content.ts");

const SOURCES = [
  { name: "AGENTS_MD", path: "AGENTS.md" },
  { name: "SKILL_MD", path: "skills/imf-design-system/SKILL.md" },
  { name: "CONTRIBUTING_MD", path: "CONTRIBUTING.md" },
];

/** Escape a raw string so it is safe inside a TS template literal. */
function esc(s) {
  return s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

async function main() {
  const blocks = [];
  for (const s of SOURCES) {
    const raw = await readFile(join(ROOT, s.path), "utf8");
    blocks.push(`export const ${s.name} = \`${esc(raw)}\`;`);
  }
  const body = `/**
 * GENERATED — do not edit by hand.
 * Source: ${SOURCES.map((s) => s.path).join(", ")}.
 * Run \`npm run guide:build\` to regenerate.
 */
/* eslint-disable */

${blocks.join("\n\n")}
`;
  await writeFile(OUT, body, "utf8");
  console.log(`✓ src/showcase/guide-content.ts (${SOURCES.length} docs)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
