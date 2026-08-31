/**
 * `generate` — turn a brand.json into distributable outputs: a shadcn registry
 * theme item (always), plus an optional globals.css scaffold and HTML preview.
 */
import { slugify } from "../utils/slug.js";
import { loadBrandFile, writeFileEnsured, writeJson, log } from "../utils/io.js";
import { printAudit, printBrandSummary } from "../utils/print.js";
import { deriveTheme } from "../core/tokens.js";
import { buildThemeRegistryItem } from "../core/registry.js";
import { renderGlobalsCss } from "../core/render.js";
import { renderPreviewHtml } from "../core/preview.js";
import { auditTokens } from "../core/audit.js";

export interface GenerateOptions {
  out?: string;
  css?: string;
  preview?: string;
  name?: string;
  audit?: boolean;
}

export async function generateCommand(brandPath: string, options: GenerateOptions): Promise<void> {
  const brand = await loadBrandFile(brandPath);
  const tokens = deriveTheme(brand);
  const slug = slugify(brand.name);

  log.heading(`Generating theme for ${brand.name}`);
  printBrandSummary(brand, tokens);

  const registryPath = options.out ?? `${slug}-theme.json`;
  const item = buildThemeRegistryItem(brand, tokens, options.name ? { name: options.name } : {});
  await writeJson(registryPath, item);
  log.success(`Registry theme → ${registryPath}`);
  log.dim(`  Apply anywhere with: npx shadcn@latest add ${registryPath}`);

  if (options.css) {
    await writeFileEnsured(options.css, renderGlobalsCss(tokens));
    log.success(`globals.css scaffold → ${options.css}`);
  }

  if (options.preview) {
    await writeFileEnsured(options.preview, renderPreviewHtml(brand, tokens));
    log.success(`HTML preview → ${options.preview}`);
  }

  if (options.audit !== false) {
    log.heading("Contrast audit (WCAG)");
    let failures = 0;
    for (const app of ["light", "dark"] as const) {
      const map = tokens[app];
      if (!map) continue;
      const result = auditTokens(map, app);
      failures += result.failures;
      printAudit(result);
    }
    if (failures === 0) log.success("\nAll contrast checks pass AA.");
    else log.warn(`\n${failures} contrast check(s) below target — review before shipping.`);
  }
}
