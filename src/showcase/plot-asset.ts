/**
 * Locate and read the vendored d3 + Observable Plot bundles so they can be
 * inlined into generated pages (keeping them self-contained). Resolves relative
 * to this module for both the built package (dist/) and dev (src/), with a CWD
 * fallback. Returns null when the assets aren't found — callers then fall back
 * to a CDN <script> tag.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export interface VendorScripts {
  d3: string;
  plot: string;
}

const here = dirname(fileURLToPath(import.meta.url));

/** Candidate `assets/` locations, most likely first. */
const CANDIDATES = [
  join(here, "..", "assets"), // dist/showcase-less: dist/ -> ../assets
  join(here, "..", "..", "assets"), // dev: src/showcase -> ../../assets
  join(here, "..", "..", "..", "assets"),
  join(process.cwd(), "assets"),
];

function findAssetsDir(): string | null {
  for (const dir of CANDIDATES) {
    if (existsSync(join(dir, "plot.umd.min.js")) && existsSync(join(dir, "d3.min.js"))) {
      return dir;
    }
  }
  return null;
}

/** Read the vendored bundles, or null if unavailable. */
export function getVendorScripts(): VendorScripts | null {
  const dir = findAssetsDir();
  if (!dir) return null;
  try {
    return {
      d3: readFileSync(join(dir, "d3.min.js"), "utf8"),
      plot: readFileSync(join(dir, "plot.umd.min.js"), "utf8"),
    };
  } catch {
    return null;
  }
}

const CDN_D3 = "https://cdn.jsdelivr.net/npm/d3@7";
const CDN_PLOT = "https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6";

/**
 * Return `<script>` tags that make `Plot` available on the page: inlined
 * (self-contained) when the vendored bundles are present, else CDN-loaded.
 */
export function renderPlotScripts(): string {
  const vendor = getVendorScripts();
  if (vendor) {
    return `<script>${vendor.d3}</script>\n<script>${vendor.plot}</script>`;
  }
  return `<script src="${CDN_D3}"></script>\n<script src="${CDN_PLOT}"></script>`;
}
