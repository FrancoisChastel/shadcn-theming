/**
 * Reverse-engineer a brand from a live website — the no-browser path.
 *
 * We fetch the HTML and a handful of its stylesheets, then mine, in order of
 * trust: declared CSS custom properties (`--primary`, `--brand`, …), the
 * `<meta name="theme-color">`, and finally the most salient color literal in
 * the CSS. Fonts come from Google Fonts links and `font-family` declarations.
 *
 * Runtime-computed variables are out of scope here; for those, drive a real
 * browser (the Agent Skill documents the Playwright/Claude-in-Chrome path).
 */
import { parse } from "node-html-parser";
import { parseColor, toHex, isAchromatic } from "../core/color.js";

export interface WebsiteBrand {
  colors: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    foreground?: string;
  };
  fonts?: { sans?: string };
  notes: string[];
}

const FETCH_TIMEOUT_MS = 10_000;
const MAX_STYLESHEETS = 5;
const MAX_CSS_BYTES = 2_000_000;
const UA =
  "Mozilla/5.0 (compatible; shadcn-theming/0.1; +https://github.com/FrancoisChastel/shadcn-theming)";

async function fetchText(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "user-agent": UA, accept: "text/html,text/css,*/*" },
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

/** Pull `--name: value` custom-property declarations out of CSS text. */
function collectCssVars(css: string): Map<string, string> {
  const vars = new Map<string, string>();
  const re = /--([\w-]+)\s*:\s*([^;{}]+)[;}]/g;
  for (const m of css.matchAll(re)) {
    const name = m[1]!.toLowerCase();
    const value = m[2]!.trim();
    if (!vars.has(name)) vars.set(name, value);
  }
  return vars;
}

/**
 * Find a CSS var whose name matches any keyword and parses as a color.
 * When `requireChroma` is set, near-neutral values are skipped — a var named
 * "primary" that resolves to near-white is almost never the actual brand color.
 */
function pickVar(
  vars: Map<string, string>,
  keywords: string[],
  requireChroma = false,
): string | undefined {
  for (const [name, value] of vars) {
    if (!keywords.some((k) => name.includes(k))) continue;
    // Skip references to other vars — we can't resolve them statically.
    if (value.includes("var(")) continue;
    try {
      const color = parseColor(value);
      if (requireChroma && (isAchromatic(color) || color.c < 0.03)) continue;
      return toHex(color);
    } catch {
      /* not a color */
    }
  }
  return undefined;
}

/** Rank color literals in CSS by salience (frequency × chroma). */
function dominantColor(css: string): string | undefined {
  const re = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)|oklch\([^)]*\)/g;
  const counts = new Map<string, number>();
  for (const m of css.matchAll(re)) {
    try {
      const color = parseColor(m[0]);
      if (isAchromatic(color) || color.c < 0.05) continue;
      const hex = toHex(color);
      counts.set(hex, (counts.get(hex) ?? 0) + 1);
    } catch {
      /* ignore */
    }
  }
  let best: string | undefined;
  let bestScore = 0;
  for (const [hex, count] of counts) {
    const score = count * (parseColor(hex).c + 0.1);
    if (score > bestScore) {
      bestScore = score;
      best = hex;
    }
  }
  return best;
}

/** Extract a sans font family name from Google Fonts links or CSS. */
function extractFont(root: ReturnType<typeof parse>, css: string): string | undefined {
  for (const link of root.querySelectorAll('link[href*="fonts.googleapis.com"]')) {
    const href = link.getAttribute("href") ?? "";
    const family = href.match(/family=([^:&]+)/)?.[1];
    if (family) return decodeURIComponent(family.replace(/\+/g, " "));
  }
  for (const m of css.matchAll(/font-family\s*:\s*([^;{}]+)[;}]/gi)) {
    const decl = m[1]!;
    const first = decl.split(",")[0]?.trim().replace(/["']/g, "") ?? "";
    // Skip generic families and unresolved var() references.
    if (!first || first.startsWith("var(")) continue;
    if (/^(inherit|initial|unset|sans-serif|serif|monospace|system-ui)$/i.test(first)) continue;
    return decl.trim().replace(/["']/g, "");
  }
  return undefined;
}

/**
 * Fetch `url` and extract a best-effort brand definition.
 */
export async function extractFromWebsite(url: string): Promise<WebsiteBrand> {
  const notes: string[] = [];
  const normalized = url.startsWith("http") ? url : `https://${url}`;
  const html = await fetchText(normalized);
  const root = parse(html);
  const origin = new URL(normalized).origin;

  // Gather CSS: inline <style> plus a few linked stylesheets.
  let css = root.querySelectorAll("style").map((s) => s.text).join("\n");
  const hrefs = root
    .querySelectorAll('link[rel="stylesheet"]')
    .map((l) => l.getAttribute("href"))
    .filter((h): h is string => Boolean(h))
    .slice(0, MAX_STYLESHEETS);
  for (const href of hrefs) {
    if (css.length > MAX_CSS_BYTES) break;
    const abs = href.startsWith("http") ? href : new URL(href, origin).href;
    try {
      css += `\n${await fetchText(abs)}`;
    } catch {
      notes.push(`Could not fetch stylesheet: ${abs}`);
    }
  }

  const vars = collectCssVars(css);
  const themeColorMeta = root
    .querySelector('meta[name="theme-color"]')
    ?.getAttribute("content");

  const primaryFromVar = pickVar(vars, ["brand", "primary", "accent-color"], true);
  const primary =
    primaryFromVar ??
    (themeColorMeta ? safeHex(themeColorMeta) : undefined) ??
    dominantColor(css);
  if (!primary) {
    throw new Error(
      `Could not detect a brand color from ${normalized}. Provide colors manually or try the browser-based extraction path.`,
    );
  }
  if (primaryFromVar) notes.push("Primary sourced from a CSS custom property.");
  else if (themeColorMeta && safeHex(themeColorMeta)) notes.push("Primary sourced from <meta theme-color>.");
  else notes.push("Primary inferred from the most salient CSS color (verify this).");

  const accent = pickVar(vars, ["accent", "secondary-color"]);
  const secondary = pickVar(vars, ["secondary"]);
  const background = pickVar(vars, ["background", "surface", "bg"]);
  const foreground = pickVar(vars, ["foreground", "text-color", "on-surface"]);
  const font = extractFont(root, css);

  return {
    colors: {
      primary,
      ...(secondary ? { secondary } : {}),
      ...(accent ? { accent } : {}),
      ...(background ? { background } : {}),
      ...(foreground ? { foreground } : {}),
    },
    ...(font ? { fonts: { sans: font } } : {}),
    notes,
  };
}

function safeHex(value: string): string | undefined {
  try {
    return toHex(parseColor(value));
  } catch {
    return undefined;
  }
}
