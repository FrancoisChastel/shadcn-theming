#!/usr/bin/env node
/**
 * Generate the React `<Icon>` registry component from the single icon source
 * (src/showcase/icons.ts). The showcase (HTML strings) and the app-facing
 * component share one set of paths, so adding an icon in one place updates both
 * and they can never drift.
 */
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src/showcase/icons.ts");
const OUT = join(ROOT, "registry/components/ui/icon.tsx");

/** Pull the `ICONS` object literal out of icons.ts and evaluate it. */
function extractIcons(source) {
  const marker = source.indexOf("export const ICONS");
  if (marker === -1) throw new Error("ICONS declaration not found in icons.ts");
  const start = source.indexOf("{", marker);
  // SVG path strings never contain braces, so counting braces on the raw text
  // reliably finds the matching close.
  let depth = 0;
  let end = -1;
  for (let i = start; i < source.length; i++) {
    const ch = source[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end === -1) throw new Error("Unterminated ICONS object literal");
  const body = source.slice(start, end + 1);
  // eslint-disable-next-line no-new-func
  return Function(`return (${body})`)();
}

/** Render the `.tsx` file content for the given name→paths map. */
function renderComponent(icons) {
  const entries = Object.keys(icons)
    .sort()
    .map((name) => `  ${JSON.stringify(name)}: ${JSON.stringify(icons[name])},`)
    .join("\n");

  return `/**
 * <Icon> — a zero-dependency icon component whose set matches the design
 * system's showcase exactly. Lucide-style 24×24 stroke paths that inherit
 * \`currentColor\`, so every icon is themed by the surrounding text color.
 *
 * GENERATED from the design system's icon source — do not edit by hand.
 * Run \`npm run build:icons\` to regenerate.
 *
 * Already using lucide-react? Import from there instead; the paths are the
 * same. This component exists so the exact showcase set is installable with no
 * runtime dependency:
 *
 *   npx shadcn@latest add https://raw.githubusercontent.com/FrancoisChastel/shadcn-theming/main/registry/icon.json
 *
 * Usage:
 *   <Icon name="search" />
 *   <Icon name="bell" size={20} className="text-primary" />
 *   <Icon name="download" aria-label="Download" />   // labeled => not aria-hidden
 */
import * as React from "react";

export const ICON_PATHS = {
${entries}
} as const;

export type IconName = keyof typeof ICON_PATHS;

export const ICON_NAMES = Object.keys(ICON_PATHS).sort() as IconName[];

export interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, "name"> {
  /** Icon identifier — one of {@link ICON_NAMES}. */
  name: IconName;
  /** Square size in px (or any CSS length). Defaults to 16. */
  size?: number | string;
}

/** Render a named icon. Decorative by default; pass \`aria-label\` to expose it. */
export function Icon({ name, size = 16, strokeWidth = 2, ...props }: IconProps) {
  const paths = ICON_PATHS[name] ?? ICON_PATHS.help;
  const labelled = props["aria-label"] != null || props["aria-labelledby"] != null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={labelled ? undefined : true}
      focusable="false"
      role={labelled ? "img" : undefined}
      {...props}
      dangerouslySetInnerHTML={{ __html: paths }}
    />
  );
}
`;
}

async function main() {
  const source = await readFile(SRC, "utf8");
  const icons = extractIcons(source);
  const count = Object.keys(icons).length;
  await writeFile(OUT, renderComponent(icons), "utf8");
  console.log(`✓ registry/components/ui/icon.tsx (${count} icons)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
