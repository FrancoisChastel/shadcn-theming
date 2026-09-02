# Demo

Self-contained, generated pages — no build step, no dependencies. Open in a
browser; use **Toggle theme** for light/dark and **⌘K** to search.

## Multi-page explorer sites

`npx shadcn-theming explore <brand.json> -o <dir>` generates a small site with a
shared top nav:

| Page | Contents |
| --- | --- |
| `index.html` | **Design system** — theme, color palette, typography, radius, headline KPIs. |
| `components.html` | Every shadcn/ui component (forms, data display, overlays, navigation, chat). |
| `layouts.html` | Layout primitives + page templates (auth, error, empty states). |
| `charts.html` | Observable-Plot charts (scientific + gallery) and KPI extensions. |
| `ai.html` | A Claude Code / Pi-style AI harness experience. |

Prebuilt:

- IMF: [`imf/index.html`](imf/index.html)
- Acme: [`acme/index.html`](acme/index.html)

Only `charts.html` inlines Observable Plot + d3 (~500KB); the other pages are
~85KB and fully offline.

## Analytics dashboard

[`imf-showcase.html`](imf-showcase.html) — a single-page IMF analytics dashboard
(KPIs + the scientific charts).

## Regenerate

```bash
npm run cli -- explore  examples/imf.brand.json -o demo/imf
npm run cli -- showcase examples/imf.brand.json -o demo/imf-showcase.html
```
