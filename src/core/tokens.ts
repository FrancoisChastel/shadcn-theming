/**
 * Derive the full shadcn/ui token set (Tailwind v4 / OKLCH) from a Brand.
 *
 * Strategy: start from shadcn's neutral scaffold — the familiar gray ramp for
 * background/card/muted/border — then overlay brand color at the points that
 * actually carry brand identity (primary, ring, accent, charts, sidebar).
 * Neutrals can optionally be tinted toward the brand hue for cohesion.
 *
 * The result reads like a genuine, hand-authored shadcn theme rather than a
 * garish full-repaint, while still being unmistakably on-brand.
 */
import type { Brand } from "./brand-schema.js";
import { radiusToCss } from "./brand-schema.js";
import {
  parseColor,
  formatOklch,
  toGamut,
  withLightness,
  scaleChroma,
  rotateHue,
  pickForeground,
  ensureContrast,
  clamp,
  type OklchColor,
} from "./color.js";

/** Canonical, ordered list of shadcn color tokens (keys without `--`). */
export const COLOR_TOKENS = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "destructive-foreground",
  "border",
  "input",
  "ring",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "sidebar",
  "sidebar-foreground",
  "sidebar-primary",
  "sidebar-primary-foreground",
  "sidebar-accent",
  "sidebar-accent-foreground",
  "sidebar-border",
  "sidebar-ring",
] as const;

export type ColorTokenKey = (typeof COLOR_TOKENS)[number];
export type Appearance = "light" | "dark";
export type TokenMap = Record<ColorTokenKey, string>;

export interface ThemeTokens {
  /** Radius as a CSS length, e.g. "0.625rem". */
  radius: string;
  /** Optional font-family stacks written into the `theme` block. */
  fonts?: { sans?: string; serif?: string; mono?: string };
  /** Color tokens per appearance; a key is present only when generated. */
  light?: TokenMap;
  dark?: TokenMap;
}

const DEFAULT_DESTRUCTIVE_LIGHT: OklchColor = { l: 0.577, c: 0.245, h: 27.325 };
const DEFAULT_DESTRUCTIVE_DARK: OklchColor = { l: 0.704, c: 0.191, h: 22.216 };

/** Build a neutral gray at lightness `l`, optionally tinted toward the brand hue. */
function makeNeutral(l: number, hue: number, tintChroma: number): OklchColor {
  return { l, c: tintChroma, h: hue };
}

/** Ensure a fill color reads as a vivid accent on a dark background. */
function vividOnDark(color: OklchColor, minL = 0.62): OklchColor {
  if (color.l >= minL) return color;
  return toGamut(withLightness(color, clamp(color.l + 0.28, minL, 0.74)));
}

/** Derive a 5-color chart palette from a seed, spread across the hue wheel. */
function chartPalette(
  seed: OklchColor,
  explicit: OklchColor[] | undefined,
  appearance: Appearance,
): OklchColor[] {
  if (explicit && explicit.length > 0) {
    const padded = [...explicit];
    // Pad by rotating the last provided color if fewer than five are given.
    while (padded.length < 5) {
      const prev = padded[padded.length - 1]!;
      padded.push(toGamut(rotateHue(prev, 48)));
    }
    return padded.slice(0, 5).map(toGamut);
  }
  // Auto: rotate around the seed hue with alternating lightness for legibility.
  const baseL = appearance === "dark" ? 0.7 : 0.62;
  const offsets = [0, 48, -32, 96, 160];
  const lightnessJitter = [0, 0.06, -0.05, 0.08, -0.03];
  const chroma = Math.max(seed.c, 0.12);
  return offsets.map((deg, i) =>
    toGamut({
      l: clamp(baseL + (lightnessJitter[i] ?? 0), 0.4, 0.85),
      c: chroma,
      h: ((seed.h + deg) % 360 + 360) % 360,
    }),
  );
}

/** Parse an optional brand color, returning undefined when absent. */
function opt(value: string | undefined): OklchColor | undefined {
  return value ? toGamut(parseColor(value)) : undefined;
}

/**
 * Derive one appearance (light or dark) of the token map from the brand.
 */
export function deriveAppearance(brand: Brand, appearance: Appearance): TokenMap {
  const isDark = appearance === "dark";
  const primary = toGamut(parseColor(brand.colors.primary));
  const neutralHue = brand.neutrals.hue ?? primary.h;
  const tint = brand.neutrals.tint ? brand.neutrals.strength : 0;
  const n = (l: number) => makeNeutral(l, neutralHue, tint);

  const secondaryBrand = opt(brand.colors.secondary);
  const accentBrand = opt(brand.colors.accent);
  const destructive = opt(brand.colors.destructive)
    ?? (isDark ? DEFAULT_DESTRUCTIVE_DARK : DEFAULT_DESTRUCTIVE_LIGHT);
  const explicitBg = opt(brand.colors.background);
  const explicitFg = opt(brand.colors.foreground);
  const explicitRing = opt(brand.colors.ring);
  const charts = chartPalette(
    primary,
    brand.charts?.map((c) => toGamut(parseColor(c))),
    appearance,
  );

  // Brand primary: keep as-is in light; brighten for vibrancy on dark surfaces.
  const primaryFill = isDark ? vividOnDark(primary) : primary;
  const primaryFg = ensureContrast(
    pickForeground(primaryFill, { tint: Math.min(primaryFill.c, 0.02) }),
    primaryFill,
    4.5,
  );

  const background = explicitBg ?? (isDark ? n(0.145) : n(1));
  const foreground = explicitFg ?? (isDark ? n(0.985) : n(0.145));

  // Surfaces sit just above the page background.
  const card = isDark ? n(0.205) : background;
  const popover = isDark ? n(0.205) : background;

  // Secondary/muted/accent default to neutrals; brand color overlays when given.
  const secondary = secondaryBrand
    ? (isDark ? vividOnDark(scaleChroma(secondaryBrand, 0.9), 0.28) : withLightness(scaleChroma(secondaryBrand, 0.5), 0.97))
    : n(isDark ? 0.269 : 0.97);
  const secondaryFg = ensureContrast(
    isDark ? n(0.985) : n(0.205),
    secondary,
    4.5,
  );

  const muted = n(isDark ? 0.269 : 0.97);
  const mutedFg = ensureContrast(n(isDark ? 0.708 : 0.556), muted, 4.5);

  // Accent is a subtle hover/active wash; tint toward brand accent when present.
  const accent = accentBrand
    ? (isDark ? withLightness(scaleChroma(accentBrand, 0.7), 0.3) : withLightness(scaleChroma(accentBrand, 0.4), 0.95))
    : n(isDark ? 0.269 : 0.97);
  const accentFg = ensureContrast(isDark ? n(0.985) : n(0.205), accent, 4.5);

  const destructiveFg = ensureContrast(pickForeground(destructive), destructive, 4.5);

  // Ring ties focus states to the brand hue.
  const ring = explicitRing
    ?? toGamut({ l: isDark ? 0.556 : 0.65, c: Math.min(primary.c, 0.16), h: primary.h });

  // Borders: neutral in light; translucent white in dark (shadcn convention).
  const border = isDark ? "oklch(1 0 0 / 10%)" : formatOklch(n(0.922));
  const input = isDark ? "oklch(1 0 0 / 15%)" : formatOklch(n(0.922));

  const sidebar = isDark ? n(0.205) : n(0.985);
  const sidebarPrimary = primaryFill;
  const sidebarPrimaryFg = primaryFg;
  const sidebarAccent = n(isDark ? 0.269 : 0.97);
  const sidebarAccentFg = ensureContrast(isDark ? n(0.985) : n(0.205), sidebarAccent, 4.5);
  const sidebarBorder = isDark ? "oklch(1 0 0 / 10%)" : formatOklch(n(0.922));

  const map: TokenMap = {
    background: formatOklch(background),
    foreground: formatOklch(foreground),
    card: formatOklch(card),
    "card-foreground": formatOklch(foreground),
    popover: formatOklch(popover),
    "popover-foreground": formatOklch(foreground),
    primary: formatOklch(primaryFill),
    "primary-foreground": formatOklch(primaryFg),
    secondary: formatOklch(secondary),
    "secondary-foreground": formatOklch(secondaryFg),
    muted: formatOklch(muted),
    "muted-foreground": formatOklch(mutedFg),
    accent: formatOklch(accent),
    "accent-foreground": formatOklch(accentFg),
    destructive: formatOklch(destructive),
    "destructive-foreground": formatOklch(destructiveFg),
    border,
    input,
    ring: formatOklch(ring),
    "chart-1": formatOklch(charts[0]!),
    "chart-2": formatOklch(charts[1]!),
    "chart-3": formatOklch(charts[2]!),
    "chart-4": formatOklch(charts[3]!),
    "chart-5": formatOklch(charts[4]!),
    sidebar: formatOklch(sidebar),
    "sidebar-foreground": formatOklch(foreground),
    "sidebar-primary": formatOklch(sidebarPrimary),
    "sidebar-primary-foreground": formatOklch(sidebarPrimaryFg),
    "sidebar-accent": formatOklch(sidebarAccent),
    "sidebar-accent-foreground": formatOklch(sidebarAccentFg),
    "sidebar-border": sidebarBorder,
    "sidebar-ring": formatOklch(ring),
  };

  return map;
}

/**
 * Derive the complete themed token set for the appearances the brand requests.
 */
export function deriveTheme(brand: Brand): ThemeTokens {
  const wantsLight = brand.appearance === "light" || brand.appearance === "both";
  const wantsDark = brand.appearance === "dark" || brand.appearance === "both";

  const fonts =
    brand.fonts && (brand.fonts.sans || brand.fonts.serif || brand.fonts.mono)
      ? {
          ...(brand.fonts.sans ? { sans: brand.fonts.sans } : {}),
          ...(brand.fonts.serif ? { serif: brand.fonts.serif } : {}),
          ...(brand.fonts.mono ? { mono: brand.fonts.mono } : {}),
        }
      : undefined;

  return {
    radius: radiusToCss(brand.radius),
    ...(fonts ? { fonts } : {}),
    ...(wantsLight ? { light: deriveAppearance(brand, "light") } : {}),
    ...(wantsDark ? { dark: deriveAppearance(brand, "dark") } : {}),
  };
}
