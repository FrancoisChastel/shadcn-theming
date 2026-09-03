# AGENTS.md

Drop this file at the root of **your product repo**. It tells any coding agent
(Claude Code, Cursor, GitHub Copilot / VS Code, Pi, Codex, Aider, Gemini CLI, …)
how to build UI with the **shadcn-theming design system** — a brand-themed
shadcn/ui setup plus installable extension components. Merge it into your
project's existing `AGENTS.md` if you already have one.

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

```bash
RAW=https://raw.githubusercontent.com/FrancoisChastel/shadcn-theming/main/registry
npx shadcn@latest add $RAW/fan-chart.json
npx shadcn@latest add $RAW/classification-badge.json
npx shadcn@latest add $RAW/icon.json
npx shadcn@latest add $RAW/data-table.json
```

To (re)apply or change the brand theme in this project:

```bash
npx shadcn-theming init                       # brand source → OKLCH tokens → globals.css
npx shadcn-theming audit brand.json --strict  # WCAG 2.2 AA gate (run in CI)
```

## Token contract — use these, never hardcode color

| Token | Use |
| --- | --- |
| `--primary` / `--primary-foreground` | brand actions, active nav |
| `--secondary`, `--accent`, `--muted` (+ `-foreground`) | surfaces, subtle fills |
| `--destructive` | errors; "strictly confidential" |
| `--chart-1..5` | categorical series colors |
| `--border`, `--input`, `--ring` | outlines, fields, focus ring |
| `--radius` | corner rounding |

Charts read `--chart-*`; classification maps `--chart-5` (public) · `--primary`
(official) · `--chart-3` (confidential) · `--destructive` (strict).

## What's available (reuse before authoring)

- **Charts** (`@/components/ui/*`): `line-chart`, `bar-chart`, `area-band`,
  `fan-chart`, `histogram`, `box-plot`, `scatter-plot`, `correlation-heatmap`,
  `waterfall-chart`, `slope-chart`, `connected-scatter`, `ecdf-plot`,
  `lorenz-curve`, `candlestick-chart`, `bullet-chart`, `donut-chart`,
  `radar-chart` (dependency-free SVG).
- **KPI / data:** `stat-card`, `sparkline`, `data-table`.
- **Security:** `classification-badge` (four levels: Public → For Official Use
  Only → Confidential → Strictly Confidential) + a banner.
- **Icons:** `<Icon name="…" />` — 100+ Lucide-style, `currentColor`. Don't paste raw SVG.
- **App shell & pages:** two-level header + variants, sidebar, footers, profile,
  settings, error/403 — browse the live explorer for markup to copy.

```tsx
import { FanChart } from "@/components/ui/fan-chart"
import { ClassificationBadge } from "@/components/ui/classification-badge"

<ClassificationBadge level="official" />
<FanChart data={weo} title="World GDP growth" yLabel="% change" />
```

## Rules when building UI

- **Reuse first.** Check the catalog above and the live explorer before writing a
  new component — most data-viz, KPI, classification, and shell needs exist.
- **No hardcoded color.** Only semantic tokens. This is non-negotiable — it's what
  keeps the brand consistent and the theme swappable.
- **Accessibility (WCAG 2.2 AA):** semantic HTML, labeled controls, visible focus,
  honor `prefers-reduced-motion`, meet contrast. Animate `transform`/`opacity` only.
- **State:** keep server / client / URL state separate; persist shareable state
  (filters, active tab, sort) in the URL.
- **Composing new UI:** build on installed primitives + tokens; type props; small,
  focused components; no `any`.

## Verify before you finish

- Your project's own checks (e.g. `typecheck`, `lint`, `build`, tests) pass.
- The screen renders with no console errors, in both light and dark themes.
- Contrast holds — run `npx shadcn-theming audit brand.json --strict` after theme edits.

## Tool notes

- **Claude Code / Cursor / Copilot (VS Code) / Codex / Aider:** this file is read
  automatically. Load the usage skill too: `npx skills add FrancoisChastel/shadcn-theming`.
- **Pi / other agents:** point the agent at this file and the design-system `SKILL.md`.
- Prefer the registry + CLI over hand-writing tokens or re-implementing components.
