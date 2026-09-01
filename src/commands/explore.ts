/**
 * `explore` — render the interactive component explorer (a shadcn-website-style
 * gallery of every component + charts) in the brand's theme.
 */
import { slugify } from "../utils/slug.js";
import { loadBrandFile, writeFileEnsured, log } from "../utils/io.js";
import { deriveTheme } from "../core/tokens.js";
import { renderExploreHtml } from "../showcase/explore.js";

export interface ExploreOptions {
  out?: string;
}

export async function exploreCommand(brandPath: string, options: ExploreOptions): Promise<void> {
  const brand = await loadBrandFile(brandPath);
  const tokens = deriveTheme(brand);
  const outPath = options.out ?? `${slugify(brand.name)}-explore.html`;
  await writeFileEnsured(outPath, renderExploreHtml(brand, tokens));
  log.success(`Component explorer → ${outPath}`);
  log.dim("  Open in a browser: interactive components, ⌘K palette, live charts.");
}
