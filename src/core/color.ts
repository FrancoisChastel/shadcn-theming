/**
 * Color science utilities for shadcn theming.
 *
 * Everything is normalized to OKLCH — the color space shadcn/ui uses for its
 * Tailwind v4 tokens — so that lightness manipulation and contrast reasoning
 * stay perceptually uniform. We lean on `culori` for parsing, conversion,
 * WCAG contrast, and gamut mapping.
 */
import {
  oklch as toOklch,
  rgb as toRgb,
  wcagContrast,
  clampChroma,
  formatHex,
  type Oklch,
} from "culori";

/** An OKLCH color with guaranteed numeric channels (hue defaults to 0). */
export interface OklchColor {
  l: number; // perceptual lightness, 0..1
  c: number; // chroma, 0..~0.4
  h: number; // hue angle, 0..360
}

/**
 * Parse any CSS color string (hex, rgb, hsl, named, oklch, …) into OKLCH.
 * Achromatic colors report hue `0` so downstream math never hits `undefined`.
 */
export function parseColor(input: string): OklchColor {
  const parsed = toOklch(input.trim());
  if (!parsed) {
    throw new Error(`Could not parse color: "${input}"`);
  }
  return {
    l: clamp(parsed.l ?? 0, 0, 1),
    c: Math.max(parsed.c ?? 0, 0),
    h: Number.isFinite(parsed.h) ? ((parsed.h as number) % 360 + 360) % 360 : 0,
  };
}

/** Is this color effectively a gray (no meaningful chroma)? */
export function isAchromatic(color: OklchColor): boolean {
  return color.c < 1e-4;
}

/** Build a culori Oklch object from our plain shape. */
function toCulori(color: OklchColor): Oklch {
  return isAchromatic(color)
    ? { mode: "oklch", l: color.l, c: 0 }
    : { mode: "oklch", l: color.l, c: color.c, h: color.h };
}

/**
 * Format an OKLCH color as the `oklch(L C H)` string shadcn writes into CSS.
 * Lightness keeps up to 4 significant digits, chroma/hue up to 3. Achromatic
 * colors collapse to `oklch(L 0 0)` to match shadcn's neutral tokens.
 */
export function formatOklch(color: OklchColor): string {
  const l = round(color.l, 4);
  if (isAchromatic(color)) {
    return `oklch(${l} 0 0)`;
  }
  const c = round(color.c, 4);
  const h = round(color.h, 3);
  return `oklch(${l} ${c} ${h})`;
}

/** Convert an OKLCH color to a `#rrggbb` hex string (gamut-clamped to sRGB). */
export function toHex(color: OklchColor): string {
  return formatHex(clampChroma(toCulori(color), "oklch")) ?? "#000000";
}

/**
 * Map a color into the sRGB gamut while preserving hue and lightness,
 * reducing chroma only as needed. Keeps rendered output consistent across
 * browsers that would otherwise clip out-of-gamut oklch values differently.
 */
export function toGamut(color: OklchColor): OklchColor {
  const clamped = toOklch(clampChroma(toCulori(color), "oklch"));
  if (!clamped) return color;
  return {
    l: clamp(clamped.l ?? color.l, 0, 1),
    c: Math.max(clamped.c ?? 0, 0),
    h: Number.isFinite(clamped.h) ? (clamped.h as number) : color.h,
  };
}

/** Return a copy with lightness set to `l` (0..1). */
export function withLightness(color: OklchColor, l: number): OklchColor {
  return { ...color, l: clamp(l, 0, 1) };
}

/** Return a copy with chroma set to `c`. */
export function withChroma(color: OklchColor, c: number): OklchColor {
  return { ...color, c: Math.max(c, 0) };
}

/** Return a copy with hue rotated by `deg` degrees. */
export function rotateHue(color: OklchColor, deg: number): OklchColor {
  return { ...color, h: ((color.h + deg) % 360 + 360) % 360 };
}

/** Multiply chroma by a factor (e.g. 0.4 to desaturate toward neutral). */
export function scaleChroma(color: OklchColor, factor: number): OklchColor {
  return withChroma(color, color.c * factor);
}

/**
 * Mix two OKLCH colors by ratio `t` (0 = a, 1 = b). Hue is interpolated along
 * the shortest arc so mixing across the 0/360 seam behaves intuitively.
 */
export function mix(a: OklchColor, b: OklchColor, t: number): OklchColor {
  const ratio = clamp(t, 0, 1);
  const l = a.l + (b.l - a.l) * ratio;
  const c = a.c + (b.c - a.c) * ratio;
  let dh = b.h - a.h;
  if (dh > 180) dh -= 360;
  if (dh < -180) dh += 360;
  const h = ((a.h + dh * ratio) % 360 + 360) % 360;
  return { l, c, h };
}

/** WCAG 2.x contrast ratio (1..21) between two OKLCH colors. */
export function contrastRatio(a: OklchColor, b: OklchColor): number {
  return wcagContrast(toCulori(a), toCulori(b));
}

const NEAR_WHITE: OklchColor = { l: 0.985, c: 0, h: 0 };
const NEAR_BLACK: OklchColor = { l: 0.145, c: 0, h: 0 };

/**
 * Pick a legible foreground for a given background. Prefers a near-white or
 * near-black token (tinted toward the background hue for cohesion), choosing
 * whichever yields higher contrast. Falls back gracefully so the result is
 * always the most legible of the two candidates.
 *
 * @param bg           background color the text sits on
 * @param opts.tint    chroma to carry into the foreground for subtle cohesion
 * @param opts.minRatio target WCAG ratio (AA body text = 4.5)
 */
export function pickForeground(
  bg: OklchColor,
  opts: { tint?: number; minRatio?: number } = {},
): OklchColor {
  const tint = opts.tint ?? 0;
  const light: OklchColor = { l: NEAR_WHITE.l, c: tint, h: bg.h };
  const dark: OklchColor = { l: NEAR_BLACK.l, c: tint, h: bg.h };
  const lightRatio = contrastRatio(bg, light);
  const darkRatio = contrastRatio(bg, dark);
  return darkRatio >= lightRatio ? dark : light;
}

/**
 * Ensure `fg` meets `minRatio` against `bg`, nudging the foreground lighter or
 * darker (in OKLCH lightness) until it does or the range is exhausted. Hue and
 * chroma are preserved. Returns the best achievable foreground.
 */
export function ensureContrast(
  fg: OklchColor,
  bg: OklchColor,
  minRatio = 4.5,
): OklchColor {
  if (contrastRatio(fg, bg) >= minRatio) return fg;
  // Search both directions from the starting foreground, increasing the step
  // each iteration, so we find the *closest* compliant lightness (preserving
  // the foreground's character) and can reach pure black/white when a
  // mid-lightness background demands it. Falls back to the best found.
  let best = fg;
  let bestRatio = contrastRatio(fg, bg);
  const STEPS = 48;
  for (let i = 1; i <= STEPS; i++) {
    const frac = i / STEPS;
    const down = withLightness(fg, fg.l - frac * fg.l);
    const up = withLightness(fg, fg.l + frac * (1 - fg.l));
    for (const candidate of [down, up]) {
      const ratio = contrastRatio(candidate, bg);
      if (ratio > bestRatio) {
        best = candidate;
        bestRatio = ratio;
      }
      if (ratio >= minRatio) return candidate;
    }
  }
  return best;
}

/** Round to `digits` decimal places, dropping trailing zeros. */
export function round(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

/** Clamp `value` into the inclusive `[min, max]` range. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
