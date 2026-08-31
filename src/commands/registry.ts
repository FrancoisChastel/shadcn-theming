/**
 * `registry` — emit only the shadcn registry theme item from a brand.json.
 * A focused alias of `generate` for CI/publishing pipelines.
 */
import { slugify } from "../utils/slug.js";
import { loadBrandFile, writeJson, log } from "../utils/io.js";
import { deriveTheme } from "../core/tokens.js";
import { buildThemeRegistryItem } from "../core/registry.js";

export interface RegistryOptions {
  out?: string;
  name?: string;
}

export async function registryCommand(brandPath: string, options: RegistryOptions): Promise<void> {
  const brand = await loadBrandFile(brandPath);
  const tokens = deriveTheme(brand);
  const item = buildThemeRegistryItem(brand, tokens, options.name ? { name: options.name } : {});
  const outPath = options.out ?? `${slugify(brand.name)}-theme.json`;
  await writeJson(outPath, item);
  log.success(`Registry theme → ${outPath}`);
  log.dim(`  npx shadcn@latest add ${outPath}`);
}
