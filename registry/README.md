# Extension components

A small set of components that shadcn/ui doesn't ship, packaged as shadcn
**registry items**. They're colored entirely through shadcn theme tokens
(`primary`, `destructive`, `chart-*`, `muted-foreground`), so they automatically
match any brand theme produced by [`shadcn-theming`](../README.md) — theme and
components stay one system.

## Install

Into any shadcn/ui project (Tailwind v4):

```bash
npx shadcn@latest add https://raw.githubusercontent.com/FrancoisChastel/shadcn-theming/main/registry/sparkline.json
npx shadcn@latest add https://raw.githubusercontent.com/FrancoisChastel/shadcn-theming/main/registry/stat-card.json
```

`stat-card` pulls in shadcn's `card` and this repo's `sparkline` automatically.

## Components

### `sparkline`

A tiny, dependency-free SVG trend line. Inherits the current text color
(`text-primary` by default).

```tsx
import { Sparkline } from "@/components/ui/sparkline"

<Sparkline data={[3, 5, 4, 8, 7, 12, 10]} fill />
<Sparkline data={series} className="text-chart-2" />
```

### `stat-card`

A KPI tile — label, headline value, trend delta, and an optional inline
sparkline. The delta's sign drives its color (`primary` up / `destructive` down).

```tsx
import { StatCard } from "@/components/ui/stat-card"

<StatCard
  label="Monthly revenue"
  value="$48.2k"
  delta={12.5}
  deltaLabel="vs last month"
  data={[30, 32, 31, 40, 42, 48]}
/>
```

## Layout

```
registry/
  components/ui/*.tsx   # component sources (edit these)
  <name>.json           # generated, installable registry items
  registry.json         # generated index (for discovery / `shadcn build`)
```

Regenerate the JSON after editing a source:

```bash
npm run registry:build
```

## Adding a component

1. Add `registry/components/ui/<name>.tsx`.
2. Register it in `scripts/build-registry.mjs` (`COMPONENTS` array), listing any
   `registryDependencies` (bare shadcn names resolve automatically; cross-repo
   items use their raw URL).
3. Run `npm run registry:build` and commit the generated JSON.

Keep components token-driven — use `text-primary`, `bg-muted`,
`text-muted-foreground`, `text-chart-*`, etc. — so they inherit any brand theme.
