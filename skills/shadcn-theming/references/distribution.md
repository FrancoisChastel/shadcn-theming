# Distribution: registry themes, npx, tweakcn

## The registry theme item

A shadcn theme is a `registry-item.json` of `type: "registry:theme"`. Its
`cssVars` has three scopes — `theme` (radius + fonts), `light`, `dark` — with
keys written **without** the leading `--`. Colors are OKLCH strings.

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "acme-theme",
  "type": "registry:theme",
  "cssVars": {
    "theme": { "radius": "0.5rem", "font-sans": "Inter, sans-serif" },
    "light": { "primary": "oklch(0.51 0.23 277)", "primary-foreground": "oklch(0.985 0.02 277)" },
    "dark":  { "primary": "oklch(0.74 0.14 277)", "primary-foreground": "oklch(0.205 0.02 277)" }
  }
}
```

`npx shadcn-theming registry brand.json -o acme-theme.json` produces exactly this.

## Applying a theme

Anyone applies it — into an existing shadcn project — with:

```bash
npx shadcn@latest add https://raw.githubusercontent.com/<org>/<repo>/main/acme-theme.json
```

The shadcn CLI merges the `cssVars` into the project's `:root` / `.dark` and adds
any missing `@theme inline` mappings. Host the JSON anywhere reachable by URL
(GitHub raw, a static site, an internal registry).

Related registry item types:

- `registry:theme` — color vars only (what a brand theme is).
- `registry:style` — a full base style (what tweakcn emits); inherits from
  `shadcn` by default.
- `registry:component` — a component (see this repo's extension components).

## tweakcn interop

tweakcn.com is a visual shadcn theme editor. Every tweakcn theme is served as a
registry item at `https://tweakcn.com/r/themes/<name>.json`, so you can apply one
directly (`npx shadcn add https://tweakcn.com/r/themes/modern-minimal.json`) or
fetch it as a reference for the OKLCH `cssVars` shape. This tool emits the same
shape, so brand themes and tweakcn themes are interchangeable inputs to
`npx shadcn add`.

## Distributing this skill

The skill itself (this folder) is portable. Users install it with the community
`skills` CLI or by copying:

```bash
npx skills add FrancoisChastel/shadcn-theming     # into ~/.claude/skills (with -g) or ./.claude/skills
# or manually:
cp -r skills/shadcn-theming ~/.claude/skills/
```

Frontmatter uses only the portable Agent Skills spec fields (`name`,
`description`, `license`, `metadata`, `allowed-tools`) so it also uploads to
claude.ai and validates with `anthropics/skills`' `package_skill.py`.
