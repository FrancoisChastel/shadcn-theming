/**
 * The canonical `brand.json` schema. Every input adapter (logo, website,
 * Figma/design-tokens) normalizes into this shape, and the token generator
 * consumes only this shape. Keeping one source of truth means the deterministic
 * core never has to care where the brand came from.
 */
import { z } from "zod";
import { parseColor } from "./color.js";

/** A CSS color string that we can actually parse into OKLCH. */
const cssColor = z
  .string()
  .min(1)
  .refine(
    (value) => {
      try {
        parseColor(value);
        return true;
      } catch {
        return false;
      }
    },
    { message: "Must be a parseable CSS color (hex, rgb, hsl, oklch, or named)" },
  );

/** Radius accepts a CSS length string ("0.625rem") or a number of rem. */
const radius = z.union([z.string().min(1), z.number().nonnegative()]);

export const brandColorsSchema = z
  .object({
    /** The primary brand color — the one required anchor for the whole theme. */
    primary: cssColor,
    /** Optional explicit secondary; otherwise derived as a neutral. */
    secondary: cssColor.optional(),
    /** Optional accent used for highlights; otherwise derived from primary. */
    accent: cssColor.optional(),
    /** Destructive/danger color; defaults to a calibrated red. */
    destructive: cssColor.optional(),
    /** Page background; defaults to near-white (light) / near-black (dark). */
    background: cssColor.optional(),
    /** Primary text color; defaults to a contrast-safe near-black/white. */
    foreground: cssColor.optional(),
    /** Focus ring; defaults to a mid tone of the primary hue. */
    ring: cssColor.optional(),
  })
  .strict();

export const brandFontsSchema = z
  .object({
    sans: z.string().min(1).optional(),
    serif: z.string().min(1).optional(),
    mono: z.string().min(1).optional(),
  })
  .strict();

export const brandNeutralsSchema = z
  .object({
    /** Subtly tint grays toward the brand hue for a more cohesive, premium feel. */
    tint: z.boolean().default(false),
    /** Override the hue used for tinting (defaults to the primary hue). */
    hue: z.number().min(0).max(360).optional(),
    /** How much chroma to carry into neutrals when tinting (0..0.02 typical). */
    strength: z.number().min(0).max(0.05).default(0.004),
  })
  .strict();

export const brandSchema = z
  .object({
    /** Schema URL for editor autocomplete; ignored by the tool. */
    $schema: z.string().optional(),
    /** Human-readable brand/company name. */
    name: z.string().min(1).default("Brand"),
    /** Optional path or URL to the brand logo (used for extraction/preview). */
    logo: z.string().optional(),
    colors: brandColorsSchema,
    /** Optional explicit chart palette seeds; auto-derived when omitted. */
    charts: z.array(cssColor).max(5).optional(),
    neutrals: brandNeutralsSchema.default({ tint: false, strength: 0.004 }),
    fonts: brandFontsSchema.optional(),
    /** Corner radius token; defaults to shadcn's 0.625rem. */
    radius: radius.default("0.625rem"),
    /** Which appearances to generate. */
    appearance: z.enum(["light", "dark", "both"]).default("both"),
  })
  .strict();

export type Brand = z.infer<typeof brandSchema>;
export type BrandInput = z.input<typeof brandSchema>;
export type BrandColors = z.infer<typeof brandColorsSchema>;
export type BrandNeutrals = z.infer<typeof brandNeutralsSchema>;

/**
 * Parse and validate an unknown value into a fully-defaulted Brand.
 * Throws a ZodError with readable messages on invalid input.
 */
export function parseBrand(input: unknown): Brand {
  return brandSchema.parse(input);
}

/** Normalize a radius value to a CSS length string. */
export function radiusToCss(value: string | number): string {
  return typeof value === "number" ? `${value}rem` : value;
}
