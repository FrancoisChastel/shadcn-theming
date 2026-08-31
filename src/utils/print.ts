/**
 * Presentation helpers for CLI output — contrast audits and brand summaries.
 */
import pc from "picocolors";
import type { AppearanceAudit } from "../core/audit.js";
import type { Brand } from "../core/brand-schema.js";
import type { ThemeTokens } from "../core/tokens.js";

/** Colorize a WCAG level label. */
function levelBadge(level: string): string {
  switch (level) {
    case "AAA":
      return pc.green("AAA");
    case "AA":
      return pc.green("AA ");
    case "AA-large":
      return pc.yellow("AA…");
    default:
      return pc.red("FAIL");
  }
}

/** Print a contrast audit for one appearance as an aligned table. */
export function printAudit(audit: AppearanceAudit): void {
  console.log(`\n  ${pc.bold(audit.appearance.toUpperCase())}  (${audit.failures} failing)`);
  for (const c of audit.checks) {
    const mark = c.passes ? pc.green("✓") : pc.red("✗");
    const ratio = `${c.ratio}`.padStart(5);
    console.log(`  ${mark} ${levelBadge(c.level)}  ${ratio}:1  ${pc.dim(c.label)}`);
  }
}

/** Print a compact summary of the assembled brand. */
export function printBrandSummary(brand: Brand, tokens: ThemeTokens): void {
  const appearances = [tokens.light && "light", tokens.dark && "dark"].filter(Boolean).join(" + ");
  console.log(`  ${pc.dim("name")}       ${brand.name}`);
  console.log(`  ${pc.dim("primary")}    ${brand.colors.primary}`);
  if (brand.colors.accent) console.log(`  ${pc.dim("accent")}     ${brand.colors.accent}`);
  console.log(`  ${pc.dim("radius")}     ${tokens.radius}`);
  console.log(`  ${pc.dim("appearance")} ${appearances}`);
  if (brand.neutrals.tint) console.log(`  ${pc.dim("neutrals")}   tinted toward brand hue`);
  if (tokens.fonts?.sans) console.log(`  ${pc.dim("font-sans")}  ${tokens.fonts.sans}`);
}
