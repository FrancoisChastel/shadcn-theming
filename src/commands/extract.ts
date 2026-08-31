/**
 * `extract` — build a brand.json from a logo, website, or design-tokens export,
 * with optional manual overrides. Writes the file (or prints it with --print)
 * so it can be reviewed and committed as the canonical brand definition.
 */
import { assembleBrand, type AssembleSources, type AssembleOverrides } from "../core/assemble.js";
import type { Brand } from "../core/brand-schema.js";
import { writeJson, log, pc } from "../utils/io.js";

export interface ExtractOptions extends AssembleOverrides {
  logo?: string;
  website?: string;
  tokens?: string;
  out?: string;
  print?: boolean;
}

export async function extractCommand(options: ExtractOptions): Promise<void> {
  const sources: AssembleSources = {
    ...(options.logo ? { logo: options.logo } : {}),
    ...(options.website ? { website: options.website } : {}),
    ...(options.tokens ? { tokens: options.tokens } : {}),
  };
  const sourceCount = Object.keys(sources).length;
  if (sourceCount === 0 && !options.primary) {
    throw new Error("Provide a source (--logo/--website/--tokens) or --primary <color>.");
  }
  if (sourceCount > 1) {
    throw new Error("Use a single source at a time (--logo OR --website OR --tokens).");
  }

  const { brand, notes, candidates } = await assembleBrand(sources, options);

  log.heading(`Extracted brand: ${brand.name}`);
  for (const note of notes) log.dim(`  ${note}`);
  if (candidates && candidates.length > 0) {
    log.info(`  candidates: ${candidates.map((c) => pc.dim(c)).join("  ")}`);
  }
  log.info(`  primary: ${brand.colors.primary}`);
  if (brand.colors.accent) log.info(`  accent:  ${brand.colors.accent}`);

  // Emit a clean brand.json (strip internal defaults that clutter the file).
  const output = toBrandJson(brand);

  if (options.print) {
    console.log(JSON.stringify(output, null, 2));
    return;
  }
  const outPath = options.out ?? "brand.json";
  await writeJson(outPath, output);
  log.success(`Wrote ${outPath}`);
  log.dim(`  Next: npx shadcn-theming generate ${outPath}  ·  or  apply ${outPath}`);
}

/** Produce a tidy brand.json object with a $schema hint and only meaningful keys. */
function toBrandJson(brand: Brand): Record<string, unknown> {
  const out: Record<string, unknown> = {
    $schema: "https://raw.githubusercontent.com/FrancoisChastel/shadcn-theming/main/schema/brand.schema.json",
    name: brand.name,
    colors: brand.colors,
  };
  if (brand.logo) out.logo = brand.logo;
  if (brand.charts) out.charts = brand.charts;
  if (brand.fonts) out.fonts = brand.fonts;
  if (brand.neutrals.tint) out.neutrals = brand.neutrals;
  out.radius = brand.radius;
  out.appearance = brand.appearance;
  return out;
}
