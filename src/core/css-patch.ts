/**
 * Idempotent CSS patching for shadcn `globals.css`.
 *
 * We deliberately avoid a full CSS AST here: shadcn's `:root` / `.dark` /
 * `@theme inline` blocks are flat declaration lists (no nested braces), so a
 * targeted, line-based block editor is both simpler and safer — it upserts the
 * variables we manage while leaving every other declaration and comment intact.
 * Running the patch twice produces identical output.
 */
import { COLOR_TOKENS, type ThemeTokens, type TokenMap } from "./tokens.js";
import { renderGlobalsCss } from "./render.js";

export interface PatchResult {
  css: string;
  /** True when the file was created from scratch (empty/non-shadcn input). */
  created: boolean;
  warnings: string[];
}

/** A CSS variable to upsert: `--<key>: <value>;` */
type Var = readonly [key: string, value: string];

const DEFAULT_INDENT = "  ";

interface BlockRange {
  /** Index of the `{`. */
  open: number;
  /** Index of the matching `}`. */
  close: number;
}

/**
 * Locate a flat rule block (`:root { … }` / `.dark { … }` / `@theme inline { … }`)
 * by a selector regex, returning the brace positions. Assumes no nested braces
 * inside the block, which holds for shadcn's declaration blocks.
 */
function findBlock(css: string, selector: RegExp): BlockRange | null {
  const match = selector.exec(css);
  if (!match) return null;
  const open = css.indexOf("{", match.index);
  if (open === -1) return null;
  const close = css.indexOf("}", open + 1);
  if (close === -1) return null;
  return { open, close };
}

/** Detect the indentation used by declaration lines inside a block. */
function detectIndent(inner: string): string {
  const match = inner.match(/\n([ \t]+)\S/);
  return match?.[1] ?? DEFAULT_INDENT;
}

/**
 * Upsert `vars` into a block's inner text: replace the value of any variable
 * that already exists (preserving its indentation), append the rest before the
 * closing brace. Non-managed lines are untouched.
 */
function upsertVars(inner: string, vars: readonly Var[], indent: string): string {
  let body = inner;
  const pending: Var[] = [];
  for (const [key, value] of vars) {
    const pattern = new RegExp(
      `(^|\\n)([ \\t]*)--${escapeRegExp(key)}\\s*:[^;\\n]*;`,
    );
    if (pattern.test(body)) {
      body = body.replace(pattern, `$1$2--${key}: ${value};`);
    } else {
      pending.push([key, value]);
    }
  }
  if (pending.length > 0) {
    const additions = pending.map(([k, v]) => `${indent}--${k}: ${v};`).join("\n");
    const trimmedEnd = body.replace(/\s*$/, "");
    body = `${trimmedEnd}\n${additions}\n`;
  }
  return body;
}

/** Replace the inner text of a block given its brace range. */
function replaceInner(css: string, range: BlockRange, newInner: string): string {
  return css.slice(0, range.open + 1) + newInner + css.slice(range.close);
}

/**
 * Upsert variables into the block matched by `selector`. When the block is
 * absent, append a fresh block (using `fallbackSelector` as its literal head).
 */
function upsertBlock(
  css: string,
  selector: RegExp,
  fallbackSelector: string,
  vars: readonly Var[],
): string {
  const range = findBlock(css, selector);
  if (!range) {
    const body = vars.map(([k, v]) => `${DEFAULT_INDENT}--${k}: ${v};`).join("\n");
    const trailing = css.endsWith("\n") ? "" : "\n";
    return `${css}${trailing}\n${fallbackSelector} {\n${body}\n}\n`;
  }
  const inner = css.slice(range.open + 1, range.close);
  const patched = upsertVars(inner, vars, detectIndent(inner));
  return replaceInner(css, range, patched);
}

const ROOT_SELECTOR = /(^|[};])\s*:root\s*\{/;
const DARK_SELECTOR = /(^|[};])\s*\.dark\s*\{/;
const THEME_INLINE_SELECTOR = /(^|[};])\s*@theme\s+inline\s*\{/;

/** Build the ordered `:root` variable list: radius, fonts, then color tokens. */
function rootVars(tokens: ThemeTokens, light: TokenMap): Var[] {
  const vars: Var[] = [["radius", tokens.radius]];
  if (tokens.fonts) {
    for (const key of ["sans", "serif", "mono"] as const) {
      const value = tokens.fonts[key];
      if (value) vars.push([`font-${key}`, value]);
    }
  }
  for (const key of COLOR_TOKENS) vars.push([key, light[key]]);
  return vars;
}

/** Build the `.dark` variable list: color tokens only. */
function darkVars(dark: TokenMap): Var[] {
  return COLOR_TOKENS.map((key) => [key, dark[key]] as Var);
}

/** Font-family mappings to ensure inside `@theme inline`, if fonts are set. */
function fontThemeInlineVars(tokens: ThemeTokens): Var[] {
  if (!tokens.fonts) return [];
  const vars: Var[] = [];
  for (const key of ["sans", "serif", "mono"] as const) {
    if (tokens.fonts[key]) vars.push([`font-${key}`, `var(--font-${key})`]);
  }
  return vars;
}

/**
 * Patch an existing `globals.css` with the derived theme, or scaffold a fresh
 * one when the input is empty or clearly not a shadcn stylesheet.
 */
export function patchGlobalsCss(existing: string, tokens: ThemeTokens): PatchResult {
  const warnings: string[] = [];
  const light = tokens.light ?? tokens.dark;
  if (!light) throw new Error("No tokens to write: brand generated neither light nor dark");

  const looksEmpty = existing.trim().length === 0;
  const hasRoot = ROOT_SELECTOR.test(existing);
  if (looksEmpty || !hasRoot) {
    if (!looksEmpty) {
      warnings.push(
        "No :root block found — wrote a full globals.css scaffold. Review the result; " +
          "your original content was replaced.",
      );
    }
    return { css: renderGlobalsCss(tokens), created: true, warnings };
  }

  let css = existing;

  // Light tokens live in :root (with radius + fonts).
  if (tokens.light) {
    css = upsertBlock(css, ROOT_SELECTOR, ":root", rootVars(tokens, tokens.light));
  } else {
    // Dark-only brand: still write radius/fonts + the dark map into :root so the
    // single appearance applies without a .dark toggle.
    css = upsertBlock(css, ROOT_SELECTOR, ":root", rootVars(tokens, light));
  }

  // Dark tokens live in .dark (only when a light appearance also exists).
  if (tokens.dark && tokens.light) {
    css = upsertBlock(css, DARK_SELECTOR, ".dark", darkVars(tokens.dark));
  }

  // Ensure font-family mappings exist in @theme inline when fonts are set.
  const fontVars = fontThemeInlineVars(tokens);
  if (fontVars.length > 0) {
    if (THEME_INLINE_SELECTOR.test(css)) {
      css = upsertBlock(css, THEME_INLINE_SELECTOR, "@theme inline", fontVars);
    } else {
      warnings.push(
        "Fonts were set but no `@theme inline` block exists to map them. Add " +
          "`--font-sans: var(--font-sans);` mappings there so utilities pick them up.",
      );
    }
  }

  return { css, created: false, warnings };
}

/** Escape a string for safe use inside a RegExp. */
function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
