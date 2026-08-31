/**
 * Render derived tokens into CSS text — both individual `:root`/`.dark`
 * variable blocks (for patching) and a complete Tailwind v4 `globals.css`
 * scaffold (for fresh projects and the demo sandbox).
 */
import { COLOR_TOKENS, type ThemeTokens, type TokenMap } from "./tokens.js";

/** Ordered font token keys written into `:root` and the `@theme inline` block. */
const FONT_KEYS = ["sans", "serif", "mono"] as const;

/** Render `--key: value;` lines for a color token map, in canonical order. */
export function renderColorVars(map: TokenMap, indent = "  "): string {
  return COLOR_TOKENS.map((key) => `${indent}--${key}: ${map[key]};`).join("\n");
}

/** Render the non-color (`theme` scope) vars: radius + optional fonts. */
export function renderThemeVars(tokens: ThemeTokens, indent = "  "): string {
  const lines: string[] = [`${indent}--radius: ${tokens.radius};`];
  if (tokens.fonts) {
    for (const key of FONT_KEYS) {
      const value = tokens.fonts[key];
      if (value) lines.push(`${indent}--font-${key}: ${value};`);
    }
  }
  return lines.join("\n");
}

/** Render the full `:root { … }` block (radius + fonts + light color tokens). */
export function renderRootBlock(tokens: ThemeTokens, light: TokenMap): string {
  return `:root {\n${renderThemeVars(tokens)}\n${renderColorVars(light)}\n}`;
}

/** Render the full `.dark { … }` block (dark color tokens only). */
export function renderDarkBlock(dark: TokenMap): string {
  return `.dark {\n${renderColorVars(dark)}\n}`;
}

/** Render the `@theme inline` mapping block bridging vars to Tailwind utilities. */
export function renderThemeInline(tokens: ThemeTokens): string {
  const lines = COLOR_TOKENS.map((key) => `  --color-${key}: var(--${key});`);
  const fontLines: string[] = [];
  if (tokens.fonts) {
    for (const key of FONT_KEYS) {
      if (tokens.fonts[key]) fontLines.push(`  --font-${key}: var(--font-${key});`);
    }
  }
  const radiusLines = [
    "  --radius-sm: calc(var(--radius) - 4px);",
    "  --radius-md: calc(var(--radius) - 2px);",
    "  --radius-lg: var(--radius);",
    "  --radius-xl: calc(var(--radius) + 4px);",
  ];
  return [
    "@theme inline {",
    ...radiusLines,
    ...(fontLines.length ? fontLines : []),
    ...lines,
    "}",
  ].join("\n");
}

/**
 * Render a complete `globals.css` for a fresh project — the full Tailwind v4
 * scaffold shadcn expects, populated with the brand tokens.
 */
export function renderGlobalsCss(tokens: ThemeTokens): string {
  const light = tokens.light ?? tokens.dark;
  if (!light) throw new Error("Cannot render globals.css: no light or dark tokens generated");
  const parts: string[] = [
    '@import "tailwindcss";',
    '@import "tw-animate-css";',
    "",
    "@custom-variant dark (&:is(.dark *));",
    "",
    renderRootBlock(tokens, light),
    "",
  ];
  if (tokens.dark) {
    parts.push(renderDarkBlock(tokens.dark), "");
  }
  parts.push(
    renderThemeInline(tokens),
    "",
    "@layer base {",
    "  * {",
    "    @apply border-border outline-ring/50;",
    "  }",
    "  body {",
    "    @apply bg-background text-foreground;",
    "  }",
    "}",
    "",
  );
  return parts.join("\n");
}
