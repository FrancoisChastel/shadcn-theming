# shadcn-theming

> Adapt **shadcn/ui** to any company's brand — from a brand guide, logo, website, or design tokens — with contrast-safe OKLCH tokens, an idempotent `globals.css` patch, and a shareable shadcn **registry theme**.

[![CI](https://github.com/FrancoisChastel/shadcn-theming/actions/workflows/ci.yml/badge.svg)](https://github.com/FrancoisChastel/shadcn-theming/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/shadcn-theming.svg)](https://www.npmjs.com/package/shadcn-theming)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

It ships as **three things**:

1. **An npx CLI** (`shadcn-theming`) that does the deterministic work — palette extraction, OKLCH token derivation, WCAG contrast correction, CSS patching, registry emission.
2. **A Claude [Agent Skill](skills/shadcn-theming)** that teaches an AI agent to drive the whole flow and verify the result. Installable with `npx skills add`.
3. **A shadcn registry extension** — brand **themes** and a few genuinely-missing **components** (a sparkline, a KPI stat card) that respect the theme's tokens, all installable with `npx shadcn add <url>`.

---

## Why

Branding shadcn by hand means hand-writing ~60 OKLCH values across `:root` and `.dark`, guessing at contrast, and repeating it per project. This turns a **single brand definition** into a correct, accessible, shareable theme — deterministically.

- 🎯 **One anchor in, a full theme out.** Give it a primary color (or a logo, or a URL) and it derives every shadcn token for light **and** dark.
- ♿ **Contrast-safe by construction.** Every text pair is checked against WCAG AA (4.5:1) and foregrounds are auto-corrected in OKLCH. `audit --strict` gates CI.
- 🧩 **Faithful to shadcn.** Neutral scaffold + brand overlay, the alpha-white dark border convention, Tailwind v4 `@theme inline` — output looks hand-authored.
- 🔗 **Shareable.** Emits a `registry:theme` item so any teammate runs `npx shadcn add <url>`.
- 🖌️ **Idempotent + surgical.** Patches only the variables it owns; re-running changes nothing; your custom declarations are preserved.

## Quick start

```bash
# Interactive — walks from a brand source to applied CSS + a registry theme
npx shadcn-theming init

# Or one-shot from an explicit color, in your shadcn project:
npx shadcn-theming extract --primary "#4f46e5" --accent "#f97316" --name "Acme" -o brand.json
npx shadcn-theming apply brand.json --dry-run     # preview the patch
npx shadcn-theming apply brand.json --yes         # write it
```

👉 **Live preview:** open [`demo/index.html`](demo/index.html) in a browser (or `npm run cli -- preview examples/acme.brand.json -o demo/index.html`).

## Brand inputs

Every source normalizes into a single [`brand.json`](schema/brand.schema.json):

```bash
# From a logo (SVG colors are exact; PNG/JPG use perceptual extraction)
npx shadcn-theming extract --logo ./logo.svg -o brand.json

# From a live website (best-effort: CSS vars, theme-color, fonts)
npx shadcn-theming extract --website https://acme.com -o brand.json

# From a design-tokens export (W3C Design Tokens or Tokens Studio / Figma)
npx shadcn-theming extract --tokens ./tokens.json -o brand.json

# Manual overrides work on top of any source
npx shadcn-theming extract --logo ./logo.svg --primary "#4f46e5" --tint -o brand.json
```

A minimal `brand.json` is just:

```json
{ "name": "Acme", "colors": { "primary": "#4f46e5" } }
```

See the [full schema + examples](skills/shadcn-theming/references/brand-json.md).

## Commands

| Command | What it does |
| --- | --- |
| `init` | Interactive wizard: source → tokens → apply + registry. |
| `extract` | Build a `brand.json` from `--logo` / `--website` / `--tokens` (+ overrides). |
| `generate <brand.json>` | Emit a registry theme (`-o`), optional `--css` scaffold and `--preview` HTML, with a contrast audit. |
| `apply <brand.json>` | Detect the shadcn project and patch its `globals.css` (`--dry-run`, `--yes`, `--css`). |
| `registry <brand.json>` | Emit only the `registry:theme` item. |
| `preview <brand.json>` | Write a self-contained HTML preview (light + dark). |
| `audit <brand.json>` | Print the WCAG contrast audit (`--strict` exits non-zero on failure). |

Run `npx shadcn-theming <command> --help` for all flags.

## Share your theme

```bash
npx shadcn-theming registry brand.json -o acme-theme.json
# host acme-theme.json anywhere reachable by URL, then anyone runs:
npx shadcn@latest add https://raw.githubusercontent.com/<org>/<repo>/main/acme-theme.json
```

This is the same registry mechanism shadcn and [tweakcn](https://tweakcn.com) use, so themes are interchangeable.

## Use with Claude (Agent Skill)

Let an AI agent handle the whole flow — gather the brand, generate, verify contrast, screenshot both themes, apply:

```bash
npx skills add FrancoisChastel/shadcn-theming
# or copy skills/shadcn-theming into ~/.claude/skills/ (or a project's .claude/skills/)
```

Then ask: *"Theme my shadcn app with our brand — here's the logo."* See [`skills/shadcn-theming`](skills/shadcn-theming/SKILL.md).

## Extension components

Beyond themes, this repo ships a small set of components that shadcn/ui doesn't include but that consume the theme's tokens (so they auto-adapt to any brand):

```bash
npx shadcn@latest add https://raw.githubusercontent.com/FrancoisChastel/shadcn-theming/main/registry/sparkline.json
npx shadcn@latest add https://raw.githubusercontent.com/FrancoisChastel/shadcn-theming/main/registry/stat-card.json
```

See [`registry/`](registry/README.md).

## How it works

1. **Normalize** the brand into `brand.json` (any source → one schema).
2. **Derive** tokens in **OKLCH** (`culori`): a shadcn neutral scaffold with brand color overlaid at `primary`, `ring`, `chart-*`, `sidebar`, and (optionally) tinted neutrals. Dark-mode primaries are brightened for vibrancy; every color is gamut-mapped to sRGB.
3. **Guarantee contrast**: each foreground is chosen and, if needed, nudged in lightness until it meets WCAG AA.
4. **Emit**: patch `:root`/`.dark` idempotently, and/or produce a `registry:theme` item and an HTML preview.

Details: [color science](skills/shadcn-theming/references/color-science.md) · [token reference](skills/shadcn-theming/references/shadcn-tokens.md) · [distribution](skills/shadcn-theming/references/distribution.md).

## Programmatic API

```ts
import { parseBrand, deriveTheme, buildThemeRegistryItem, auditTokens } from "shadcn-theming";

const brand = parseBrand({ name: "Acme", colors: { primary: "#4f46e5" } });
const tokens = deriveTheme(brand);
const theme = buildThemeRegistryItem(brand, tokens);
const audit = auditTokens(tokens.light!, "light");
```

## Development

```bash
npm install
npm run cli -- generate examples/acme.brand.json --preview /tmp/p.html  # run the CLI from source
npm test            # vitest
npm run typecheck   # tsc --noEmit
npm run build       # tsup → dist/
```

Requirements: Node ≥ 18. Targets **Tailwind v4** shadcn projects (OKLCH tokens).

## Contributing

Issues and PRs welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md). Security reports: [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE) © Francois Chastel
