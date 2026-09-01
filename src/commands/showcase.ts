/**
 * `showcase` — render a comprehensive self-contained HTML page featuring the
 * full component set and every scientific chart in the brand's theme.
 */
import { slugify } from "../utils/slug.js";
import { loadBrandFile, writeFileEnsured, log } from "../utils/io.js";
import { deriveTheme } from "../core/tokens.js";
import { renderShowcaseHtml } from "../showcase/render.js";

export interface ShowcaseOptions {
  out?: string;
}

export async function showcaseCommand(brandPath: string, options: ShowcaseOptions): Promise<void> {
  const brand = await loadBrandFile(brandPath);
  const tokens = deriveTheme(brand);
  const outPath = options.out ?? `${slugify(brand.name)}-showcase.html`;
  await writeFileEnsured(outPath, renderShowcaseHtml(brand, tokens));
  log.success(`Showcase → ${outPath}`);
  log.dim("  Open in a browser; toggle theme to check dark mode.");
}
