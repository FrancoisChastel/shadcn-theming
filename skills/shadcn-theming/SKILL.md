---
name: shadcn-theming
description: >-
  Adapt shadcn/ui to a company's brand. Turn a brand guide, logo image, website
  URL, or design-tokens export into contrast-safe OKLCH theme tokens, patch the
  project's globals.css, and emit a shareable shadcn registry theme. Use this
  whenever the user wants to brand or theme a shadcn/ui project, apply a
  company's colors / logo / fonts / radius, generate or preview a shadcn theme,
  build a shareable theme others can install with `npx shadcn add`, or fix a
  theme's color contrast (WCAG).
license: MIT
metadata:
  version: 0.1.0
  homepage: https://github.com/FrancoisChastel/shadcn-theming
allowed-tools: Bash, Read, Edit, Write, Glob, Grep, WebFetch
---

# shadcn-theming

Adapt a shadcn/ui project to a specific company brand. The mechanical work —
deriving a full OKLCH token set, guaranteeing WCAG contrast, patching CSS,
emitting a registry theme — is done deterministically by the `shadcn-theming`
CLI. Your job is to gather the brand, drive the CLI, and verify the result.

## When to use

- "Theme my shadcn app with our brand colors / this logo / our website."
- "Make a shadcn theme for <company> and let the team install it."
- "Our buttons fail contrast — fix the theme."
- "Generate light + dark tokens from these design tokens / this brand guide."

## The tool

Run via npx (no install needed):

```bash
npx shadcn-theming@latest <command>
```

Commands (all take/produce a `brand.json` — the canonical brand definition):

| Command | Purpose |
| --- | --- |
| `init` | Interactive wizard: source → tokens → apply + registry. |
| `extract --logo/--website/--tokens [-o brand.json] [--print]` | Build a `brand.json` from a source. |
| `generate <brand.json> [-o theme.json] [--css globals.css] [--preview p.html]` | Registry theme (+ optional css/preview) with a contrast audit. |
| `apply <brand.json> [--cwd dir] [--css path] [--dry-run] [--yes]` | Detect the shadcn project and patch its `globals.css`. |
| `registry <brand.json> [-o theme.json]` | Emit only the registry `registry:theme` item. |
| `preview <brand.json> [-o p.html]` | Self-contained HTML preview (light + dark). |
| `audit <brand.json> [--strict]` | Print the WCAG contrast audit. |

If the user is inside this repo, prefer `node dist/cli.js` (after `npm run build`) or `npm run cli --`.

## Workflow

### 1. Determine the brand source

Ask (or infer) which input you have, then build a `brand.json`:

- **Explicit colors** → write `brand.json` directly, or `extract --primary "#.." --accent "#.." --name "Acme"`.
- **Logo file** (`.svg` preferred, `.png/.jpg` ok) → `npx shadcn-theming extract --logo ./logo.svg -o brand.json`.
  - SVG colors are exact; raster uses perceptual swatch extraction. The CLI prints candidate colors — show them and let the user confirm the primary.
- **Website** → `npx shadcn-theming extract --website https://acme.com -o brand.json`.
  - This is **best-effort static extraction**. For exact, computed brand values, drive a real browser instead (see "Website: high-accuracy path").
- **Design tokens / Figma** → export a W3C or Tokens Studio JSON, then `extract --tokens ./tokens.json`.
  - If a Figma MCP server is connected, pull variables/styles with it, save a tokens JSON, then import.

Always **read the resulting `brand.json` back to the user** and confirm the primary/accent/radius/fonts before applying.

### 2. Decide the intent (neutral vs vivid)

Two good defaults — pick based on the brand:

- **Restrained (recommended default):** brand color drives `primary`, `ring`, charts, and the sidebar; neutrals stay gray. Looks like a real shadcn theme. This is what the CLI does out of the box.
- **Cohesive/premium:** add `"neutrals": { "tint": true }` to gently tint grays toward the brand hue. Use for luxury/editorial brands; avoid when the brand is a very saturated hue.

### 3. Generate + verify BEFORE applying

```bash
npx shadcn-theming generate brand.json --preview theme-preview.html
```

- Read the printed **contrast audit**. Every text pair must pass AA (≥ 4.5). The CLI auto-corrects foregrounds, but if a pair still fails, the brand primary is likely too light/dark for its role — surface this and propose an adjusted primary.
- Open the preview to eyeball light + dark. If you have browser tools (Claude-in-Chrome / Playwright), open `theme-preview.html` and screenshot both themes at 1440 and 375 widths.

### 4. Apply to the project

```bash
npx shadcn-theming apply brand.json --dry-run   # inspect the patch first
npx shadcn-theming apply brand.json --yes       # write it
```

- The patch is **idempotent** and **surgical**: it upserts `:root` / `.dark` variables and preserves every other declaration. Re-running changes nothing.
- It reads `components.json` for the CSS path; if absent it falls back to conventional locations. Pass `--css <path>` to target a specific stylesheet.
- Tell the user to restart the dev server if tokens don't hot-reload.

### 5. Make it shareable (registry)

```bash
npx shadcn-theming registry brand.json -o acme-theme.json
```

Host `acme-theme.json` (GitHub raw URL, or a static site) and anyone applies it with:

```bash
npx shadcn@latest add https://raw.githubusercontent.com/<org>/<repo>/main/acme-theme.json
```

This is the best distribution mechanism — it's the same one shadcn and tweakcn use.

## Website: high-accuracy path

Static extraction misses runtime-computed CSS variables. When accuracy matters
and you have browser automation available, gather the brand yourself:

1. Open the site. In the page, read `getComputedStyle(document.documentElement)`
   and collect `--*` custom properties; read `<meta name="theme-color">`; read
   computed `font-family` on `body`, headings, and buttons.
2. Screenshot the hero; if needed, sample dominant non-neutral colors.
3. Write those into a `brand.json` and continue from step 2 above.

## Guardrails

- **Never hand-edit token values you can derive.** Let the CLI compute OKLCH +
  contrast; only override deliberate brand anchors in `brand.json`.
- **Confirm before writing** to a user's `globals.css` (use `--dry-run` first).
  Don't overwrite a file that has no `:root` block without flagging it — the CLI
  warns and scaffolds; relay that warning.
- **Preserve the shadcn dark convention:** dark `--border`/`--input` are
  translucent white (`oklch(1 0 0 / 10%)`), not solid grays. The CLI does this;
  don't "fix" it.
- **`components.json` `baseColor` is fixed at init.** You can change the CSS
  variable *values* (what this tool does) but not switch the base palette family
  without re-initializing shadcn.

## References

Load these for detail when needed:

- `references/shadcn-tokens.md` — the canonical token list, `globals.css`
  structure (Tailwind v4), and default OKLCH values.
- `references/color-science.md` — OKLCH, contrast-safe foreground pairing, tonal
  scales, and how the derivation makes brand-aligned decisions.
- `references/distribution.md` — registry items, `npx shadcn add`, tweakcn
  interop, and how to publish a brand theme.
- `references/brand-json.md` — the full `brand.json` schema with examples.
