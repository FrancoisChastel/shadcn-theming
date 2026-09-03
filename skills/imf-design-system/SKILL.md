---
name: imf-design-system
description: >-
  Build product UI with the shadcn-theming design system — a brand-themed
  shadcn/ui setup plus installable extension components: scientific/analytical
  charts (fan chart, violin, ridgeline, waterfall, slopegraph, Lorenz, ECDF,
  radar, candlestick, box/scatter/heatmap, KPI sparkline & stat card), document
  confidentiality UI (classification badges/banner), and an enterprise app shell
  (two-level header, sidebar, footers). Use this whenever the user wants to build
  a dashboard, analytics/data-viz UI, an internal/enterprise tool, a document or
  reporting surface, or to standardize UI on a shared, token-driven design system
  — and wants it to match a company brand. Works alongside the sibling
  `shadcn-theming` (generate/apply a brand theme) and `shadcn-theming-components`
  skills.
license: MIT
metadata:
  version: 0.1.0
  homepage: https://github.com/FrancoisChastel/shadcn-theming
allowed-tools: Bash, Read, Edit, Write, Grep, Glob
---

# imf-design-system

A **token-driven** design system layered on shadcn/ui. Everything colors itself
through the theme's CSS variables, so the same components adapt to any brand
(the worked example is the IMF). This skill is about **using** the system to
build product UI and **standardizing** how a team builds it.

Golden rules:

1. **Theme first, then components.** Apply a brand theme so tokens exist, then
   install only the components you need.
2. **Never hardcode color.** Use semantic tokens (below). This is what makes
   charts, badges, and the shell re-theme for free.
3. **Reuse before you build.** Most data-viz, KPI, classification, and app-shell
   needs already ship — check the catalog first.

## 1. Apply a brand theme

```bash
npx shadcn-theming init                       # interactive: brand → OKLCH tokens → globals.css
# or one-shot from a color / logo / site:
npx shadcn-theming extract --primary "#004C97" --name "Acme" -o brand.json
npx shadcn-theming apply brand.json --yes
# or add a prebuilt registry theme:
npx shadcn@latest add https://raw.githubusercontent.com/FrancoisChastel/shadcn-theming/main/registry/themes/imf-theme.json
```

Verify contrast: `npx shadcn-theming audit brand.json --strict` (WCAG AA, exits
non-zero on failure — wire it into CI to keep the system honest).

## 2. Install components

Each item installs into a shadcn/ui (Tailwind v4) project. Shared deps
(`@observablehq/plot`, `d3-shape`) and libs (`lib/use-plot`, `lib/stats`) come in
automatically via `registryDependencies`.

```bash
RAW=https://raw.githubusercontent.com/FrancoisChastel/shadcn-theming/main/registry
npx shadcn@latest add $RAW/fan-chart.json
npx shadcn@latest add $RAW/classification-badge.json
npx shadcn@latest add $RAW/icon.json
```

## 3. The token contract (use these, not hex)

| Token | Use |
| --- | --- |
| `--primary` / `--primary-foreground` | brand actions, active nav |
| `--secondary`, `--accent`, `--muted` (+ `-foreground`) | surfaces, subtle fills |
| `--destructive` | errors, "strictly confidential" |
| `--chart-1..5` | series colors (5-way categorical) |
| `--border`, `--input`, `--ring` | outlines, fields, focus |
| `--radius` | corner rounding |

Charts read `--chart-*`; classification maps green=`--chart-5` (public),
`--primary` (official), `--chart-3` (confidential), `--destructive` (strict).

## 4. Component catalog

- **Charts (Observable Plot):** `line-chart`, `bar-chart`, `area-band` / `fan-chart`
  (WEO projection fans), `histogram` (+KDE), `box-plot`, `scatter-plot` (regression
  band), `correlation-heatmap`, `waterfall-chart`, `slope-chart`,
  `connected-scatter`, `ecdf-plot`, `lorenz-curve` (+Gini), `candlestick-chart`,
  `bullet-chart`, `donut-chart`. **`radar-chart`** is dependency-free SVG.
- **KPI:** `stat-card`, `sparkline`, `data-table` (sort/filter/select/paginate/export).
- **Security:** `classification-badge` — the four levels (Public → For Official
  Use Only → Confidential → Strictly Confidential) as shield badges + a banner.
- **Icons:** `<Icon name="…" />` — 100+ Lucide-style icons, `currentColor`.
- **App shell & pages:** headers (two-level enterprise + variants), sidebars,
  footers, profile/settings, error/403 states — see the live explorer.

Example:

```tsx
import { FanChart } from "@/components/ui/fan-chart"
import { ClassificationBadge } from "@/components/ui/classification-badge"

<ClassificationBadge level="official" />
<FanChart data={weo} title="World GDP growth" yLabel="% change" />
```

## 5. Building common surfaces

- **Dashboard:** `stat-card` row + 2-col chart grid (`fan-chart`, `bar-chart`,
  `donut-chart`) + `data-table`. Keep KPIs to one row; lead with the headline chart.
- **Classified document / report:** wrap content with a `ClassificationBanner`
  top and bottom; mark list rows with `ClassificationBadge`.
- **App shell:** enterprise header + sidebar rail/panel + content + status footer.
- **Distribution analysis:** `histogram`, `box-plot`/violin, `ecdf-plot`, `hexbin`.

## 6. Conventions (standardize on these)

- Semantic HTML + WCAG 2.2 AA; labeled controls; visible focus; reduced-motion.
- Compositor-friendly motion only (`transform`, `opacity`).
- Server state vs client state vs URL state kept separate; persist shareable state
  (filters, tab, sort) in the URL.
- Small, focused components; props typed; no `any`.

## 7. Use across tools

- **Claude Code / Cursor / Codex / Aider / Copilot (VS Code):** `AGENTS.md` at the
  repo root is read automatically; run `npx skills add FrancoisChastel/shadcn-theming`
  to load this skill.
- **Pi / others:** point the agent at this `SKILL.md` and `AGENTS.md`.

## 8. Extend in your own app

When you need something the catalog doesn't cover, compose it on top of the
installed primitives — keep it token-driven and typed so it stays consistent:

- Color only through the tokens above; reuse `<Icon>`, `data-table`, `stat-card`,
  and the chart primitives rather than re-implementing them.
- Match the system's accessibility and motion rules (section 6).
- Put it in your project's `components/ui/` like any other shadcn component.

Want to contribute the component back to the shared library so others get it?
That's a separate flow — see the **Develop → Contribute** page of the explorer
(or `CONTRIBUTING.md` in the repo) for the create-a-component + PR process.
