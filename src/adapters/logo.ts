/**
 * Extract brand colors from a logo image.
 *
 * - SVG: parse `fill` / `stroke` / `stop-color` / `style` declarations directly.
 *   This yields the *exact* brand colors the designer specified — always
 *   preferable to sampling a rasterized version.
 * - Raster (PNG/JPG/…): use node-vibrant's perceptual swatch extraction.
 *
 * The result is a partial brand `colors` object plus the raw candidate palette,
 * ready to merge into a full brand.json.
 */
import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import { parseColor, toHex, isAchromatic, type OklchColor } from "../core/color.js";

export interface ExtractedPalette {
  /** Best-guess brand colors, ready to spread into brand.colors. */
  colors: {
    primary: string;
    secondary?: string;
    accent?: string;
  };
  /** All distinct candidate colors found, most salient first (hex). */
  candidates: string[];
  source: "svg" | "raster";
}

/** Colors this saturated or more are treated as "brand" (vs neutral chrome). */
const MIN_BRAND_CHROMA = 0.04;

/** Extract a hex palette from raw SVG markup. */
function extractSvgColors(svg: string): string[] {
  const found: string[] = [];
  const push = (value: string | undefined) => {
    if (!value) return;
    const v = value.trim();
    if (!v || v === "none" || v === "transparent" || v.startsWith("url(")) return;
    try {
      found.push(toHex(parseColor(v)));
    } catch {
      // ignore unparseable tokens
    }
  };

  // Attribute forms: fill="#fff", stroke="rgb(...)", stop-color="..."
  const attrRe = /(?:fill|stroke|stop-color|flood-color|lighting-color)\s*=\s*"([^"]*)"/gi;
  for (const m of svg.matchAll(attrRe)) push(m[1]);

  // Inline style forms: style="fill:#fff;stop-color:rgb(...)"
  const styleRe = /(?:fill|stroke|stop-color|color)\s*:\s*([^;"'}]+)/gi;
  for (const m of svg.matchAll(styleRe)) push(m[1]);

  // Bare hex tokens as a last resort (covers <style> blocks and gradients).
  const hexRe = /#[0-9a-fA-F]{3,8}\b/g;
  for (const m of svg.matchAll(hexRe)) push(m[0]);

  return found;
}

/** Rank + dedupe candidate colors: most saturated brand colors first. */
function rankCandidates(colors: OklchColor[]): OklchColor[] {
  const byHex = new Map<string, OklchColor>();
  for (const c of colors) byHex.set(toHex(c), c);
  return [...byHex.values()].sort((a, b) => b.c - a.c);
}

/** Choose primary/secondary/accent from a ranked candidate list. */
function chooseColors(ranked: OklchColor[]): ExtractedPalette["colors"] {
  const brandy = ranked.filter((c) => !isAchromatic(c) && c.c >= MIN_BRAND_CHROMA);
  const pool = brandy.length > 0 ? brandy : ranked;
  if (pool.length === 0) {
    throw new Error("No usable colors found in logo");
  }
  const primary = pool[0]!;
  // Accent: the next color with a clearly different hue from primary.
  const accent = pool.slice(1).find((c) => hueDistance(c.h, primary.h) > 40);
  // Secondary: the next remaining distinct color.
  const secondary = pool
    .slice(1)
    .find((c) => c !== accent && hueDistance(c.h, primary.h) > 15);

  return {
    primary: toHex(primary),
    ...(secondary ? { secondary: toHex(secondary) } : {}),
    ...(accent ? { accent: toHex(accent) } : {}),
  };
}

/** Smallest angular distance between two hues (0..180). */
function hueDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

/** Extract brand colors from a raster image via node-vibrant. */
async function extractRaster(path: string): Promise<ExtractedPalette> {
  // Dynamic import keeps the heavy image stack out of the hot path for other commands.
  const { Vibrant } = (await import("node-vibrant/node")) as {
    Vibrant: { from: (src: string) => { getPalette: () => Promise<Record<string, { hex: string } | null>> } };
  };
  const palette = await Vibrant.from(path).getPalette();
  const order = ["Vibrant", "DarkVibrant", "LightVibrant", "Muted", "DarkMuted", "LightMuted"];
  const candidates = order
    .map((k) => palette[k]?.hex)
    .filter((v): v is string => Boolean(v));
  if (candidates.length === 0) throw new Error("node-vibrant returned no swatches");
  const ranked = rankCandidates(candidates.map((h) => parseColor(h)));
  return {
    colors: chooseColors(ranked),
    candidates: ranked.map(toHex),
    source: "raster",
  };
}

/**
 * Extract a brand palette from a logo file at `path`.
 * Dispatches on extension: `.svg` → XML parse, otherwise raster decode.
 */
export async function extractFromLogo(path: string): Promise<ExtractedPalette> {
  const ext = extname(path).toLowerCase();
  if (ext === ".svg") {
    const svg = await readFile(path, "utf8");
    const ranked = rankCandidates(extractSvgColors(svg).map((h) => parseColor(h)));
    return { colors: chooseColors(ranked), candidates: ranked.map(toHex), source: "svg" };
  }
  return extractRaster(path);
}
