/**
 * `explore` — render the interactive component explorer as a multi-page site
 * (Home, Foundations, Components, Layouts & pages, Charts, AI harness) in the
 * brand's theme, written into an output directory.
 */
import { join } from "node:path";
import { slugify } from "../utils/slug.js";
import { loadBrandFile, writeFileEnsured, log } from "../utils/io.js";
import { deriveTheme } from "../core/tokens.js";
import { renderExploreSite } from "../showcase/explore.js";

export interface ExploreOptions {
  /** Output directory for the generated site. */
  out?: string;
}

export async function exploreCommand(brandPath: string, options: ExploreOptions): Promise<void> {
  const brand = await loadBrandFile(brandPath);
  const tokens = deriveTheme(brand);
  const dir = options.out ?? `${slugify(brand.name)}-explore`;
  const site = renderExploreSite(brand, tokens);

  for (const [file, html] of Object.entries(site)) {
    await writeFileEnsured(join(dir, file), html);
  }

  log.success(`Component explorer → ${dir}/`);
  log.dim(`  ${Object.keys(site).length} pages: ${Object.keys(site).join(", ")}`);
  log.dim(`  Open ${join(dir, "index.html")} in a browser.`);
}
