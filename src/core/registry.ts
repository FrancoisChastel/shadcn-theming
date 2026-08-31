/**
 * Build shadcn registry items from derived tokens.
 *
 * A theme is emitted as a `registry:theme` item whose `cssVars` carry the
 * `theme` (radius + fonts), `light`, and `dark` scopes — the exact shape the
 * shadcn CLI merges into a project's `globals.css` when a user runs
 * `npx shadcn add <url>`. Keys are written WITHOUT the leading `--`, matching
 * the registry-item schema.
 */
import type { Brand } from "./brand-schema.js";
import { COLOR_TOKENS, type ThemeTokens, type TokenMap } from "./tokens.js";
import { slugify } from "../utils/slug.js";

export const REGISTRY_ITEM_SCHEMA = "https://ui.shadcn.com/schema/registry-item.json";
export const REGISTRY_SCHEMA = "https://ui.shadcn.com/schema/registry.json";

export interface RegistryCssVars {
  theme?: Record<string, string>;
  light?: Record<string, string>;
  dark?: Record<string, string>;
}

export interface RegistryThemeItem {
  $schema: string;
  name: string;
  type: "registry:theme";
  title?: string;
  description?: string;
  cssVars: RegistryCssVars;
}

/** Convert an ordered TokenMap into a plain `{ key: value }` cssVars scope. */
function toCssVarScope(map: TokenMap): Record<string, string> {
  const scope: Record<string, string> = {};
  for (const key of COLOR_TOKENS) scope[key] = map[key];
  return scope;
}

/** Build the `theme` scope (radius + fonts) for a registry item. */
function themeScope(tokens: ThemeTokens): Record<string, string> {
  const scope: Record<string, string> = { radius: tokens.radius };
  if (tokens.fonts) {
    if (tokens.fonts.sans) scope["font-sans"] = tokens.fonts.sans;
    if (tokens.fonts.serif) scope["font-serif"] = tokens.fonts.serif;
    if (tokens.fonts.mono) scope["font-mono"] = tokens.fonts.mono;
  }
  return scope;
}

export interface BuildRegistryOptions {
  /** Override the item name (defaults to `<brand-slug>-theme`). */
  name?: string;
}

/** Build a `registry:theme` item from a brand + its derived tokens. */
export function buildThemeRegistryItem(
  brand: Brand,
  tokens: ThemeTokens,
  options: BuildRegistryOptions = {},
): RegistryThemeItem {
  const name = options.name ?? `${slugify(brand.name)}-theme`;
  const cssVars: RegistryCssVars = { theme: themeScope(tokens) };
  if (tokens.light) cssVars.light = toCssVarScope(tokens.light);
  if (tokens.dark) cssVars.dark = toCssVarScope(tokens.dark);

  return {
    $schema: REGISTRY_ITEM_SCHEMA,
    name,
    type: "registry:theme",
    title: `${brand.name} Theme`,
    description: `shadcn/ui theme generated from the ${brand.name} brand.`,
    cssVars,
  };
}

/** Serialize a registry item to pretty JSON. */
export function stringifyRegistryItem(item: object): string {
  return `${JSON.stringify(item, null, 2)}\n`;
}
