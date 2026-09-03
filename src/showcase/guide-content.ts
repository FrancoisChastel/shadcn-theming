/**
 * GENERATED — do not edit by hand.
 * Source: AGENTS.md, skills/imf-design-system/SKILL.md, CONTRIBUTING.md.
 * Run `npm run guide:build` to regenerate.
 */
/* eslint-disable */

export const AGENTS_MD = `# AGENTS.md

Drop this file at the root of **your product repo**. It tells any coding agent
(Claude Code, Cursor, GitHub Copilot / VS Code, Pi, Codex, Aider, Gemini CLI, …)
how to build UI with the **shadcn-theming design system** — a brand-themed
shadcn/ui setup plus installable extension components. Merge it into your
project's existing \`AGENTS.md\` if you already have one.

> This is the *design-system* section of your agent guide. Keep your own
> project's build/test/deploy commands and conventions alongside it.

## The design system

- It's **shadcn/ui on Tailwind v4**, re-skinned to a brand via **OKLCH tokens**,
  plus extra components (scientific/analytical charts, KPI tiles, document
  classification, an app shell).
- **Everything is token-driven.** Components color themselves from CSS variables,
  so they match the brand automatically. This only works if you use the tokens.

## Install into this project

Components come from a public shadcn registry — add only what a task needs.

\`\`\`bash
RAW=https://raw.githubusercontent.com/FrancoisChastel/shadcn-theming/main/registry
npx shadcn@latest add $RAW/fan-chart.json
npx shadcn@latest add $RAW/classification-badge.json
npx shadcn@latest add $RAW/icon.json
npx shadcn@latest add $RAW/data-table.json
\`\`\`

To (re)apply or change the brand theme in this project:

\`\`\`bash
npx shadcn-theming init                       # brand source → OKLCH tokens → globals.css
npx shadcn-theming audit brand.json --strict  # WCAG 2.2 AA gate (run in CI)
\`\`\`

## Token contract — use these, never hardcode color

| Token | Use |
| --- | --- |
| \`--primary\` / \`--primary-foreground\` | brand actions, active nav |
| \`--secondary\`, \`--accent\`, \`--muted\` (+ \`-foreground\`) | surfaces, subtle fills |
| \`--destructive\` | errors; "strictly confidential" |
| \`--chart-1..5\` | categorical series colors |
| \`--border\`, \`--input\`, \`--ring\` | outlines, fields, focus ring |
| \`--radius\` | corner rounding |

Charts read \`--chart-*\`; classification maps \`--chart-5\` (public) · \`--primary\`
(official) · \`--chart-3\` (confidential) · \`--destructive\` (strict).

## What's available (reuse before authoring)

- **Charts** (\`@/components/ui/*\`): \`line-chart\`, \`bar-chart\`, \`area-band\`,
  \`fan-chart\`, \`histogram\`, \`box-plot\`, \`scatter-plot\`, \`correlation-heatmap\`,
  \`waterfall-chart\`, \`slope-chart\`, \`connected-scatter\`, \`ecdf-plot\`,
  \`lorenz-curve\`, \`candlestick-chart\`, \`bullet-chart\`, \`donut-chart\`,
  \`radar-chart\` (dependency-free SVG).
- **KPI / data:** \`stat-card\`, \`sparkline\`, \`data-table\`.
- **Security:** \`classification-badge\` (four levels: Public → For Official Use
  Only → Confidential → Strictly Confidential) + a banner.
- **Icons:** \`<Icon name="…" />\` — 100+ Lucide-style, \`currentColor\`. Don't paste raw SVG.
- **App shell & pages:** two-level header + variants, sidebar, footers, profile,
  settings, error/403 — browse the live explorer for markup to copy.

\`\`\`tsx
import { FanChart } from "@/components/ui/fan-chart"
import { ClassificationBadge } from "@/components/ui/classification-badge"

<ClassificationBadge level="official" />
<FanChart data={weo} title="World GDP growth" yLabel="% change" />
\`\`\`

## Rules when building UI

- **Reuse first.** Check the catalog above and the live explorer before writing a
  new component — most data-viz, KPI, classification, and shell needs exist.
- **No hardcoded color.** Only semantic tokens. This is non-negotiable — it's what
  keeps the brand consistent and the theme swappable.
- **Accessibility (WCAG 2.2 AA):** semantic HTML, labeled controls, visible focus,
  honor \`prefers-reduced-motion\`, meet contrast. Animate \`transform\`/\`opacity\` only.
- **State:** keep server / client / URL state separate; persist shareable state
  (filters, active tab, sort) in the URL.
- **Composing new UI:** build on installed primitives + tokens; type props; small,
  focused components; no \`any\`.

## Verify before you finish

- Your project's own checks (e.g. \`typecheck\`, \`lint\`, \`build\`, tests) pass.
- The screen renders with no console errors, in both light and dark themes.
- Contrast holds — run \`npx shadcn-theming audit brand.json --strict\` after theme edits.

## Tool notes

- **Claude Code / Cursor / Copilot (VS Code) / Codex / Aider:** this file is read
  automatically. Load the usage skill too: \`npx skills add FrancoisChastel/shadcn-theming\`.
- **Pi / other agents:** point the agent at this file and the design-system \`SKILL.md\`.
- Prefer the registry + CLI over hand-writing tokens or re-implementing components.
`;

export const SKILL_MD = `---
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
  \`shadcn-theming\` (generate/apply a brand theme) and \`shadcn-theming-components\`
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

\`\`\`bash
npx shadcn-theming init                       # interactive: brand → OKLCH tokens → globals.css
# or one-shot from a color / logo / site:
npx shadcn-theming extract --primary "#004C97" --name "Acme" -o brand.json
npx shadcn-theming apply brand.json --yes
# or add a prebuilt registry theme:
npx shadcn@latest add https://raw.githubusercontent.com/FrancoisChastel/shadcn-theming/main/registry/themes/imf-theme.json
\`\`\`

Verify contrast: \`npx shadcn-theming audit brand.json --strict\` (WCAG AA, exits
non-zero on failure — wire it into CI to keep the system honest).

## 2. Install components

Each item installs into a shadcn/ui (Tailwind v4) project. Shared deps
(\`@observablehq/plot\`, \`d3-shape\`) and libs (\`lib/use-plot\`, \`lib/stats\`) come in
automatically via \`registryDependencies\`.

\`\`\`bash
RAW=https://raw.githubusercontent.com/FrancoisChastel/shadcn-theming/main/registry
npx shadcn@latest add $RAW/fan-chart.json
npx shadcn@latest add $RAW/classification-badge.json
npx shadcn@latest add $RAW/icon.json
\`\`\`

## 3. The token contract (use these, not hex)

| Token | Use |
| --- | --- |
| \`--primary\` / \`--primary-foreground\` | brand actions, active nav |
| \`--secondary\`, \`--accent\`, \`--muted\` (+ \`-foreground\`) | surfaces, subtle fills |
| \`--destructive\` | errors, "strictly confidential" |
| \`--chart-1..5\` | series colors (5-way categorical) |
| \`--border\`, \`--input\`, \`--ring\` | outlines, fields, focus |
| \`--radius\` | corner rounding |

Charts read \`--chart-*\`; classification maps green=\`--chart-5\` (public),
\`--primary\` (official), \`--chart-3\` (confidential), \`--destructive\` (strict).

## 4. Component catalog

- **Charts (Observable Plot):** \`line-chart\`, \`bar-chart\`, \`area-band\` / \`fan-chart\`
  (WEO projection fans), \`histogram\` (+KDE), \`box-plot\`, \`scatter-plot\` (regression
  band), \`correlation-heatmap\`, \`waterfall-chart\`, \`slope-chart\`,
  \`connected-scatter\`, \`ecdf-plot\`, \`lorenz-curve\` (+Gini), \`candlestick-chart\`,
  \`bullet-chart\`, \`donut-chart\`. **\`radar-chart\`** is dependency-free SVG.
- **KPI:** \`stat-card\`, \`sparkline\`, \`data-table\` (sort/filter/select/paginate/export).
- **Security:** \`classification-badge\` — the four levels (Public → For Official
  Use Only → Confidential → Strictly Confidential) as shield badges + a banner.
- **Icons:** \`<Icon name="…" />\` — 100+ Lucide-style icons, \`currentColor\`.
- **App shell & pages:** headers (two-level enterprise + variants), sidebars,
  footers, profile/settings, error/403 states — see the live explorer.

Example:

\`\`\`tsx
import { FanChart } from "@/components/ui/fan-chart"
import { ClassificationBadge } from "@/components/ui/classification-badge"

<ClassificationBadge level="official" />
<FanChart data={weo} title="World GDP growth" yLabel="% change" />
\`\`\`

## 5. Building common surfaces

- **Dashboard:** \`stat-card\` row + 2-col chart grid (\`fan-chart\`, \`bar-chart\`,
  \`donut-chart\`) + \`data-table\`. Keep KPIs to one row; lead with the headline chart.
- **Classified document / report:** wrap content with a \`ClassificationBanner\`
  top and bottom; mark list rows with \`ClassificationBadge\`.
- **App shell:** enterprise header + sidebar rail/panel + content + status footer.
- **Distribution analysis:** \`histogram\`, \`box-plot\`/violin, \`ecdf-plot\`, \`hexbin\`.

## 6. Conventions (standardize on these)

- Semantic HTML + WCAG 2.2 AA; labeled controls; visible focus; reduced-motion.
- Compositor-friendly motion only (\`transform\`, \`opacity\`).
- Server state vs client state vs URL state kept separate; persist shareable state
  (filters, tab, sort) in the URL.
- Small, focused components; props typed; no \`any\`.

## 7. Use across tools

- **Claude Code / Cursor / Codex / Aider / Copilot (VS Code):** \`AGENTS.md\` at the
  repo root is read automatically; run \`npx skills add FrancoisChastel/shadcn-theming\`
  to load this skill.
- **Pi / others:** point the agent at this \`SKILL.md\` and \`AGENTS.md\`.

## 8. Extend in your own app

When you need something the catalog doesn't cover, compose it on top of the
installed primitives — keep it token-driven and typed so it stays consistent:

- Color only through the tokens above; reuse \`<Icon>\`, \`data-table\`, \`stat-card\`,
  and the chart primitives rather than re-implementing them.
- Match the system's accessibility and motion rules (section 6).
- Put it in your project's \`components/ui/\` like any other shadcn component.

Want to contribute the component back to the shared library so others get it?
That's a separate flow — see the **Develop → Contribute** page of the explorer
(or \`CONTRIBUTING.md\` in the repo) for the create-a-component + PR process.
`;

export const CONTRIBUTING_MD = `# Contributing to shadcn-theming

Thanks for your interest! This project turns a brand definition into a
contrast-safe shadcn/ui theme. Contributions of all sizes are welcome.

## Development setup

\`\`\`bash
git clone https://github.com/FrancoisChastel/shadcn-theming.git
cd shadcn-theming
npm install
\`\`\`

Common tasks:

| Command | Purpose |
| --- | --- |
| \`npm run cli -- <args>\` | Run the CLI from TypeScript source (via tsx). |
| \`npm test\` | Run the vitest suite. |
| \`npm run test:cov\` | Run tests with coverage (thresholds enforced). |
| \`npm run typecheck\` | \`tsc --noEmit\`. |
| \`npm run build\` | Bundle to \`dist/\` with tsup. |

## Project layout

\`\`\`
src/
  core/       color math, token derivation, css patch, registry, audit, preview
  adapters/   logo · website · design-tokens → brand.json
  commands/   one file per CLI command
  cli.ts      commander wiring
  index.ts    public programmatic API
skills/       the Agent Skill (SKILL.md + references)
registry/     extension components as shadcn registry items
test/         vitest specs (mirror src/core)
\`\`\`

## Guidelines

- **Keep the core deterministic and pure.** \`src/core/*\` should be free of I/O
  and side effects (except the CSS patcher's string work). This is what makes
  the output testable and reproducible.
- **OKLCH everywhere.** Use the helpers in \`src/core/color.ts\`; don't hand-roll
  color math.
- **Preserve shadcn conventions.** Token names, ordering, and the dark
  alpha-white \`border\`/\`input\` values must match upstream.
- **Add tests** for any new derivation rule, adapter, or command behavior.
  Coverage thresholds are enforced in CI.
- **Type strictly.** No \`any\` in application code; validate external input with
  the zod schema.
- **Small files, clear names.** Match the surrounding style.

## Pull requests

1. Branch from \`main\`.
2. Make sure \`npm run typecheck\`, \`npm test\`, and \`npm run build\` pass.
3. Use [Conventional Commits](https://www.conventionalcommits.org/)
   (\`feat:\`, \`fix:\`, \`docs:\`, \`refactor:\`, \`test:\`, \`chore:\`).
4. Describe the change and, for visual/theme changes, include a before/after
   preview (\`npx shadcn-theming preview brand.json\`).

By contributing you agree your work is licensed under the project's
[MIT License](LICENSE).
`;
