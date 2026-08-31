/**
 * Import a brand from a design-tokens JSON export.
 *
 * Supports the two formats teams actually export from Figma and design systems:
 *   - W3C Design Tokens:  `{ "$value": "#...", "$type": "color" }`
 *   - Tokens Studio:      `{ "value": "#...", "type": "color" }`
 *
 * Nested groups are flattened to dotted paths, `{alias.references}` are
 * resolved, and semantic brand roles are matched by keyword against the token
 * path (e.g. any token whose path contains "primary" or "brand").
 */
import { parseColor, toHex } from "../core/color.js";

export interface TokenImportResult {
  colors: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    foreground?: string;
    destructive?: string;
  };
  radius?: string;
  fonts?: { sans?: string; serif?: string; mono?: string };
  notes: string[];
}

interface FlatToken {
  path: string;
  value: string;
  type?: string;
}

/** Read the `$value`/`value` and `$type`/`type` of a token-ish node. */
function readToken(node: Record<string, unknown>): { value: unknown; type?: string } | null {
  if ("$value" in node) return { value: node["$value"], type: node["$type"] as string | undefined };
  if ("value" in node) return { value: node["value"], type: node["type"] as string | undefined };
  return null;
}

/** Recursively flatten a token tree into dotted-path leaves. */
function flatten(node: unknown, prefix: string, out: FlatToken[]): void {
  if (!node || typeof node !== "object") return;
  const record = node as Record<string, unknown>;
  const token = readToken(record);
  if (token && (typeof token.value === "string" || typeof token.value === "number")) {
    out.push({ path: prefix, value: String(token.value), ...(token.type ? { type: token.type } : {}) });
    return;
  }
  for (const [key, child] of Object.entries(record)) {
    if (key.startsWith("$") || key === "value" || key === "type") continue;
    flatten(child, prefix ? `${prefix}.${key}` : key, out);
  }
}

/** Resolve `{a.b.c}` aliases against the flattened token set (bounded passes). */
function resolveAliases(tokens: FlatToken[]): FlatToken[] {
  const byPath = new Map(tokens.map((t) => [t.path, t]));
  const aliasRe = /^\{([^}]+)\}$/;
  const resolve = (value: string, depth: number): string => {
    const m = value.match(aliasRe);
    if (!m || depth > 10) return value;
    const target = byPath.get(m[1]!);
    if (!target) return value;
    return resolve(target.value, depth + 1);
  };
  return tokens.map((t) => ({ ...t, value: resolve(t.value, 0) }));
}

/** First token whose path includes any keyword and whose value parses as a color. */
function findColor(tokens: FlatToken[], keywords: string[]): string | undefined {
  for (const t of tokens) {
    const path = t.path.toLowerCase();
    if (t.type && t.type !== "color") continue;
    if (!keywords.some((k) => path.includes(k))) continue;
    try {
      return toHex(parseColor(t.value));
    } catch {
      /* not a color */
    }
  }
  return undefined;
}

/** First token matching keywords with a matching type (fontFamily/dimension). */
function findByType(
  tokens: FlatToken[],
  keywords: string[],
  types: string[],
): string | undefined {
  for (const t of tokens) {
    const path = t.path.toLowerCase();
    if (t.type && !types.includes(t.type)) continue;
    if (!keywords.some((k) => path.includes(k))) continue;
    return t.value;
  }
  return undefined;
}

/**
 * Import a brand definition from a parsed design-tokens JSON object.
 */
export function importFromTokens(json: unknown): TokenImportResult {
  const flat: FlatToken[] = [];
  flatten(json, "", flat);
  const tokens = resolveAliases(flat);
  const notes: string[] = [];

  const primary = findColor(tokens, ["primary", "brand"]);
  if (!primary) {
    throw new Error(
      "No primary/brand color token found. Ensure a token path contains 'primary' or 'brand'.",
    );
  }

  const colors: TokenImportResult["colors"] = { primary };
  const secondary = findColor(tokens, ["secondary"]);
  const accent = findColor(tokens, ["accent"]);
  const background = findColor(tokens, ["background", "surface", "canvas"]);
  const foreground = findColor(tokens, ["foreground", "text", "on-surface", "on-background"]);
  const destructive = findColor(tokens, ["destructive", "danger", "error", "negative", "critical"]);
  if (secondary) colors.secondary = secondary;
  if (accent) colors.accent = accent;
  if (background) colors.background = background;
  if (foreground) colors.foreground = foreground;
  if (destructive) colors.destructive = destructive;

  const radius = findByType(
    tokens,
    ["radius", "radii", "rounded", "corner", "border-radius"],
    ["dimension", "borderRadius", "borderRadii", "sizing"],
  );
  const sans = findByType(tokens, ["sans", "body", "default", "font"], ["fontFamily", "fontFamilies"]);
  const serif = findByType(tokens, ["serif", "heading", "display"], ["fontFamily", "fontFamilies"]);
  const mono = findByType(tokens, ["mono", "code"], ["fontFamily", "fontFamilies"]);

  const fonts =
    sans || serif || mono
      ? { ...(sans ? { sans } : {}), ...(serif ? { serif } : {}), ...(mono ? { mono } : {}) }
      : undefined;

  notes.push(`Imported ${tokens.length} tokens; matched brand roles by path keyword.`);

  return {
    colors,
    ...(radius ? { radius: normalizeRadius(radius) } : {}),
    ...(fonts ? { fonts } : {}),
    notes,
  };
}

/** Normalize a radius token value ("8" | "8px" | "0.5rem") to a CSS length. */
function normalizeRadius(value: string): string {
  const trimmed = value.trim();
  if (/^[0-9.]+$/.test(trimmed)) return `${trimmed}px`;
  return trimmed;
}
