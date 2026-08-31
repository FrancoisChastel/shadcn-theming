/**
 * Detect a shadcn project so the CLI knows where to write CSS variables.
 *
 * Preference order: read `components.json` (the source of truth shadcn itself
 * uses) for the `tailwind.css` path; otherwise fall back to the conventional
 * stylesheet locations for Next.js / Vite shadcn setups.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

export interface DetectedProject {
  /** Directory containing components.json (or the search root when absent). */
  root: string;
  /** Absolute path to components.json, if found. */
  componentsJsonPath?: string;
  /** Absolute path to the target CSS file (globals.css / index.css). */
  cssPath: string;
  /** The base color palette shadcn was initialized with, if known. */
  baseColor?: string;
  /** Whether the project uses CSS-variable theming (vs utility classes). */
  cssVariables?: boolean;
  /** True when the css file actually exists on disk. */
  cssExists: boolean;
}

const COMMON_CSS_PATHS = [
  "app/globals.css",
  "src/app/globals.css",
  "src/styles/globals.css",
  "styles/globals.css",
  "src/index.css",
  "src/App.css",
  "app/app.css",
];

interface ComponentsJson {
  tailwind?: {
    css?: string;
    baseColor?: string;
    cssVariables?: boolean;
  };
}

/** Walk up from `startDir` looking for a components.json, stopping at the fs root. */
function findComponentsJson(startDir: string): string | undefined {
  let dir = resolve(startDir);
  for (let depth = 0; depth < 12; depth++) {
    const candidate = join(dir, "components.json");
    if (existsSync(candidate)) return candidate;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return undefined;
}

/** Find the first conventional stylesheet that exists under `root`. */
function findConventionalCss(root: string): string | undefined {
  for (const rel of COMMON_CSS_PATHS) {
    const candidate = join(root, rel);
    if (existsSync(candidate)) return candidate;
  }
  return undefined;
}

/**
 * Detect the shadcn project rooted at (or above) `cwd`.
 *
 * @param cwd            directory to start the search from
 * @param explicitCss    an explicit CSS path override (relative or absolute)
 */
export function detectProject(cwd: string, explicitCss?: string): DetectedProject {
  const start = resolve(cwd);

  if (explicitCss) {
    const cssPath = resolve(start, explicitCss);
    return { root: dirname(cssPath), cssPath, cssExists: existsSync(cssPath) };
  }

  const componentsJsonPath = findComponentsJson(start);
  if (componentsJsonPath) {
    const root = dirname(componentsJsonPath);
    let config: ComponentsJson = {};
    try {
      config = JSON.parse(readFileSync(componentsJsonPath, "utf8")) as ComponentsJson;
    } catch {
      // Malformed components.json — fall back to conventional discovery below.
    }
    const declaredCss = config.tailwind?.css;
    const cssPath = declaredCss
      ? resolve(root, declaredCss)
      : findConventionalCss(root) ?? resolve(root, "app/globals.css");
    return {
      root,
      componentsJsonPath,
      cssPath,
      ...(config.tailwind?.baseColor ? { baseColor: config.tailwind.baseColor } : {}),
      ...(config.tailwind?.cssVariables !== undefined
        ? { cssVariables: config.tailwind.cssVariables }
        : {}),
      cssExists: existsSync(cssPath),
    };
  }

  const conventional = findConventionalCss(start);
  const cssPath = conventional ?? resolve(start, "app/globals.css");
  return { root: start, cssPath, cssExists: existsSync(cssPath) };
}
