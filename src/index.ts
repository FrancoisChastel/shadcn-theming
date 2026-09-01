/**
 * Public programmatic API for shadcn-theming.
 *
 * Import this to build theming into your own scripts or tools:
 *
 * ```ts
 * import { parseBrand, deriveTheme, buildThemeRegistryItem } from "shadcn-theming";
 * ```
 */
export { parseBrand, brandSchema, radiusToCss } from "./core/brand-schema.js";
export type { Brand, BrandInput, BrandColors, BrandNeutrals } from "./core/brand-schema.js";

export { deriveTheme, deriveAppearance, COLOR_TOKENS } from "./core/tokens.js";
export type { ThemeTokens, TokenMap, ColorTokenKey, Appearance } from "./core/tokens.js";

export {
  renderGlobalsCss,
  renderRootBlock,
  renderDarkBlock,
  renderThemeInline,
} from "./core/render.js";

export { patchGlobalsCss } from "./core/css-patch.js";
export type { PatchResult } from "./core/css-patch.js";

export {
  buildThemeRegistryItem,
  stringifyRegistryItem,
  REGISTRY_ITEM_SCHEMA,
} from "./core/registry.js";
export type { RegistryThemeItem, RegistryCssVars } from "./core/registry.js";

export { auditTokens } from "./core/audit.js";
export type { AppearanceAudit, ContrastCheck, ContrastLevel } from "./core/audit.js";

export { detectProject } from "./core/project.js";
export type { DetectedProject } from "./core/project.js";

export { assembleBrand } from "./core/assemble.js";
export type { AssembleSources, AssembleOverrides, AssembledBrand } from "./core/assemble.js";

export { extractFromLogo } from "./adapters/logo.js";
export { extractFromWebsite } from "./adapters/website.js";
export { importFromTokens } from "./adapters/tokens-import.js";

export {
  parseColor,
  formatOklch,
  toHex,
  contrastRatio,
  pickForeground,
  ensureContrast,
} from "./core/color.js";
export type { OklchColor } from "./core/color.js";

export { renderPreviewHtml } from "./core/preview.js";
export { renderShowcaseHtml } from "./showcase/render.js";
