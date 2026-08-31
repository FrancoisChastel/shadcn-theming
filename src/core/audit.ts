/**
 * WCAG contrast audit for a generated token map. Checks that every
 * foreground/surface pair a user actually reads meets AA, and surfaces any
 * that fall short so the theme can be trusted (or flagged) before it ships.
 */
import { parseColor, contrastRatio, round } from "./color.js";
import type { Appearance, TokenMap } from "./tokens.js";

export type ContrastLevel = "AAA" | "AA" | "AA-large" | "fail";

export interface ContrastCheck {
  label: string;
  foreground: string;
  background: string;
  ratio: number;
  /** Minimum ratio required for this pair to be considered passing. */
  required: number;
  level: ContrastLevel;
  passes: boolean;
}

export interface AppearanceAudit {
  appearance: Appearance;
  checks: ContrastCheck[];
  failures: number;
  minRatio: number;
}

/**
 * Foreground/background pairs to verify. Text pairs require AA body (4.5);
 * the ring-on-background pair is a UI indicator, so 3.0 suffices.
 */
const PAIRS: ReadonlyArray<
  readonly [fg: keyof TokenMap, bg: keyof TokenMap, label: string, required: number]
> = [
  ["foreground", "background", "Body text", 4.5],
  ["card-foreground", "card", "Card text", 4.5],
  ["popover-foreground", "popover", "Popover text", 4.5],
  ["primary-foreground", "primary", "Primary button", 4.5],
  ["secondary-foreground", "secondary", "Secondary button", 4.5],
  ["muted-foreground", "muted", "Muted text", 4.5],
  ["muted-foreground", "background", "Muted text on page", 4.5],
  ["accent-foreground", "accent", "Accent text", 4.5],
  ["destructive-foreground", "destructive", "Destructive button", 4.5],
  ["sidebar-foreground", "sidebar", "Sidebar text", 4.5],
  ["sidebar-primary-foreground", "sidebar-primary", "Sidebar primary", 4.5],
  ["sidebar-accent-foreground", "sidebar-accent", "Sidebar accent", 4.5],
  ["ring", "background", "Focus ring", 3.0],
];

function levelFor(ratio: number, required: number): ContrastLevel {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA-large";
  return ratio >= required ? "AA-large" : "fail";
}

/** Audit a single appearance's token map. */
export function auditTokens(map: TokenMap, appearance: Appearance): AppearanceAudit {
  const checks: ContrastCheck[] = PAIRS.map(([fgKey, bgKey, label, required]) => {
    const fg = parseColor(map[fgKey]);
    const bg = parseColor(map[bgKey]);
    const ratio = round(contrastRatio(fg, bg), 2);
    const passes = ratio >= required;
    return {
      label,
      foreground: map[fgKey],
      background: map[bgKey],
      ratio,
      required,
      level: levelFor(ratio, required),
      passes,
    };
  });
  const failures = checks.filter((c) => !c.passes).length;
  const minRatio = checks.reduce((min, c) => Math.min(min, c.ratio), Number.POSITIVE_INFINITY);
  return { appearance, checks, failures, minRatio };
}
