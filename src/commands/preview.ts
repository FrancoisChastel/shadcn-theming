/**
 * `preview` — render a self-contained HTML page previewing the theme's tokens
 * and component mockups in light + dark. Handy for eyeballing or screenshotting.
 */
import { slugify } from "../utils/slug.js";
import { loadBrandFile, writeFileEnsured, log } from "../utils/io.js";
import { deriveTheme } from "../core/tokens.js";
import { renderPreviewHtml } from "../core/preview.js";

export interface PreviewOptions {
  out?: string;
}

export async function previewCommand(brandPath: string, options: PreviewOptions): Promise<void> {
  const brand = await loadBrandFile(brandPath);
  const tokens = deriveTheme(brand);
  const outPath = options.out ?? `${slugify(brand.name)}-preview.html`;
  await writeFileEnsured(outPath, renderPreviewHtml(brand, tokens));
  log.success(`Preview → ${outPath}`);
  log.dim("  Open it in a browser and use the Toggle theme button to check dark mode.");
}
