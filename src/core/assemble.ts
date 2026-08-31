/**
 * Assemble a validated Brand from any supported source plus manual overrides.
 * This is the single funnel every input path (logo, website, tokens, flags)
 * flows through before token derivation, so the rest of the tool only ever
 * deals with a clean brand.json.
 */
import { parseBrand, type Brand, type BrandInput } from "./brand-schema.js";
import { extractFromLogo } from "../adapters/logo.js";
import { extractFromWebsite } from "../adapters/website.js";
import { importFromTokens } from "../adapters/tokens-import.js";
import { readJson } from "../utils/io.js";

export interface AssembleSources {
  /** Path to a logo image to extract a palette from. */
  logo?: string;
  /** Website URL to reverse-engineer a brand from. */
  website?: string;
  /** Path to a design-tokens JSON file to import. */
  tokens?: string;
}

export interface AssembleOverrides {
  name?: string;
  primary?: string;
  secondary?: string;
  accent?: string;
  destructive?: string;
  background?: string;
  foreground?: string;
  radius?: string;
  fontSans?: string;
  fontSerif?: string;
  fontMono?: string;
  appearance?: "light" | "dark" | "both";
  tint?: boolean;
}

export interface AssembledBrand {
  brand: Brand;
  notes: string[];
  /** Candidate colors surfaced by an extractor (for user review). */
  candidates?: string[];
}

/** Deep-ish merge of brand color/font partials (override wins when defined). */
function mergeInput(base: BrandInput, patch: Partial<BrandInput>): BrandInput {
  return {
    ...base,
    ...patch,
    colors: { ...base.colors, ...(patch.colors ?? {}) },
    fonts: patch.fonts || base.fonts ? { ...(base.fonts ?? {}), ...(patch.fonts ?? {}) } : undefined,
  };
}

/**
 * Build a Brand from at most one source plus overrides. When no source is
 * given, overrides alone must supply a primary color.
 */
export async function assembleBrand(
  sources: AssembleSources,
  overrides: AssembleOverrides = {},
): Promise<AssembledBrand> {
  const notes: string[] = [];
  let candidates: string[] | undefined;
  // Start from a permissive shell; primary is filled by a source or an override.
  let input: BrandInput = { name: overrides.name ?? "Brand", colors: { primary: "#000000" } };
  let hasSourcePrimary = false;

  if (sources.logo) {
    const result = await extractFromLogo(sources.logo);
    input = mergeInput(input, { logo: sources.logo, colors: result.colors });
    candidates = result.candidates;
    hasSourcePrimary = true;
    notes.push(`Extracted ${result.candidates.length} colors from logo (${result.source}).`);
  } else if (sources.website) {
    const result = await extractFromWebsite(sources.website);
    input = mergeInput(input, {
      colors: result.colors as BrandInput["colors"],
      ...(result.fonts ? { fonts: result.fonts } : {}),
    });
    hasSourcePrimary = Boolean(result.colors.primary);
    notes.push(...result.notes);
  } else if (sources.tokens) {
    const json = await readJson(sources.tokens);
    const result = importFromTokens(json);
    input = mergeInput(input, {
      colors: result.colors as BrandInput["colors"],
      ...(result.radius ? { radius: result.radius } : {}),
      ...(result.fonts ? { fonts: result.fonts } : {}),
    });
    hasSourcePrimary = Boolean(result.colors.primary);
    notes.push(...result.notes);
  }

  // Apply manual overrides on top of whatever the source produced.
  const overrideColors: Partial<BrandInput["colors"]> = {};
  if (overrides.primary) overrideColors.primary = overrides.primary;
  if (overrides.secondary) overrideColors.secondary = overrides.secondary;
  if (overrides.accent) overrideColors.accent = overrides.accent;
  if (overrides.destructive) overrideColors.destructive = overrides.destructive;
  if (overrides.background) overrideColors.background = overrides.background;
  if (overrides.foreground) overrideColors.foreground = overrides.foreground;

  const overrideFonts: Record<string, string> = {};
  if (overrides.fontSans) overrideFonts.sans = overrides.fontSans;
  if (overrides.fontSerif) overrideFonts.serif = overrides.fontSerif;
  if (overrides.fontMono) overrideFonts.mono = overrides.fontMono;

  input = mergeInput(input, {
    ...(overrides.name ? { name: overrides.name } : {}),
    ...(Object.keys(overrideColors).length ? { colors: overrideColors as BrandInput["colors"] } : {}),
    ...(Object.keys(overrideFonts).length ? { fonts: overrideFonts } : {}),
    ...(overrides.radius ? { radius: overrides.radius } : {}),
    ...(overrides.appearance ? { appearance: overrides.appearance } : {}),
    ...(overrides.tint !== undefined ? { neutrals: { tint: overrides.tint } } : {}),
  });

  if (!hasSourcePrimary && !overrides.primary) {
    throw new Error(
      "No primary color determined. Provide a source (--logo/--website/--tokens) or --primary <color>.",
    );
  }

  return { brand: parseBrand(input), notes, ...(candidates ? { candidates } : {}) };
}
