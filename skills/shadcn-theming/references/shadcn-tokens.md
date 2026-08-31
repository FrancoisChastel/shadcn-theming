# shadcn/ui token reference (Tailwind v4 / OKLCH)

The stylesheet is `globals.css`. shadcn uses OKLCH color values since the
Tailwind v4 migration. Structure:

```css
@import "tailwindcss";
@import "tw-animate-css";              /* replaces tailwindcss-animate in v4 */
@custom-variant dark (&:is(.dark *));

:root { /* light token VALUES */ }
.dark  { /* dark  token VALUES */ }

@theme inline {                        /* maps var(--token) → --color-* utilities */
  --color-background: var(--background);
  --color-primary: var(--primary);
  /* …one line per color token… */
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground; }
}
```

## Canonical tokens + default values (base color `neutral`)

Every surface token `X` pairs with `X-foreground` (text/icon color on that
surface). Components use them together: `bg-primary text-primary-foreground`.

| Token | light | dark |
| --- | --- | --- |
| `--background` / `--foreground` | `oklch(1 0 0)` / `oklch(0.145 0 0)` | `oklch(0.145 0 0)` / `oklch(0.985 0 0)` |
| `--card` / `--card-foreground` | `oklch(1 0 0)` / `oklch(0.145 0 0)` | `oklch(0.205 0 0)` / `oklch(0.985 0 0)` |
| `--popover` / `--popover-foreground` | `oklch(1 0 0)` / `oklch(0.145 0 0)` | `oklch(0.205 0 0)` / `oklch(0.985 0 0)` |
| `--primary` / `--primary-foreground` | `oklch(0.205 0 0)` / `oklch(0.985 0 0)` | `oklch(0.922 0 0)` / `oklch(0.205 0 0)` |
| `--secondary` / `--secondary-foreground` | `oklch(0.97 0 0)` / `oklch(0.205 0 0)` | `oklch(0.269 0 0)` / `oklch(0.985 0 0)` |
| `--muted` / `--muted-foreground` | `oklch(0.97 0 0)` / `oklch(0.556 0 0)` | `oklch(0.269 0 0)` / `oklch(0.708 0 0)` |
| `--accent` / `--accent-foreground` | `oklch(0.97 0 0)` / `oklch(0.205 0 0)` | `oklch(0.269 0 0)` / `oklch(0.985 0 0)` |
| `--destructive` | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` |
| `--border` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` |
| `--input` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 15%)` |
| `--ring` | `oklch(0.708 0 0)` | `oklch(0.556 0 0)` |
| `--chart-1..5` | brand-derived | brand-derived |
| `--radius` | `0.625rem` | inherited |
| `--sidebar` / `--sidebar-foreground` | `oklch(0.985 0 0)` / `oklch(0.145 0 0)` | `oklch(0.205 0 0)` / `oklch(0.985 0 0)` |
| `--sidebar-primary` / `-foreground` | `oklch(0.205 0 0)` / `oklch(0.985 0 0)` | brand / `oklch(0.985 0 0)` |
| `--sidebar-accent` / `-foreground` | `oklch(0.97 0 0)` / `oklch(0.205 0 0)` | `oklch(0.269 0 0)` / `oklch(0.985 0 0)` |
| `--sidebar-border` / `--sidebar-ring` | `oklch(0.922 0 0)` / `oklch(0.708 0 0)` | `oklch(1 0 0 / 10%)` / `oklch(0.556 0 0)` |

## Details that matter

- **Dark `--border` / `--input` are translucent white** (`oklch(1 0 0 / 10%)`,
  `/ 15%`) — not solid grays. Preserve this; it composites correctly over any
  dark surface. This tool emits exactly that.
- The `oklch(L C H)` format: L is 0..1, C is chroma, H is degrees. Achromatic
  neutrals are `oklch(L 0 0)`.
- `--destructive` in the base has no `-foreground` pair by default (components
  use white); this tool still emits `--destructive-foreground` for safety, which
  tweakcn-style themes also do.
- `components.json → tailwind.baseColor` (neutral|gray|zinc|stone|slate) is the
  starting palette and **cannot be changed after init**. This tool changes the
  variable *values*, which is independent of the base family.

Source: https://ui.shadcn.com/docs/theming · https://ui.shadcn.com/r/colors/neutral.json
