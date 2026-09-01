# Demo sandbox

Self-contained pages — no build step, no dependencies. Open in any browser and
click **Toggle theme** for light/dark.

| Page | What it shows |
| --- | --- |
| [`imf-showcase.html`](imf-showcase.html) | **Flagship**: shadcn branded as the IMF — KPIs, components, and the full scientific-chart set (WEO fan chart, histogram+KDE, Phillips-curve regression, box plots, correlation heatmap) on synthetic macro data. |
| [`acme-showcase.html`](acme-showcase.html) | The same full showcase for the Acme example brand. |
| [`index.html`](index.html) | A lighter component-only preview (buttons, card, badges, chart palette). |

All are styled entirely with generated OKLCH theme tokens, so they double as
visual-regression surfaces.

## Regenerate for any brand

```bash
# from the repo root
npm run cli -- showcase examples/imf.brand.json -o demo/imf-showcase.html
npm run cli -- preview  examples/acme.brand.json -o demo/index.html

# or for your own brand
npx shadcn-theming showcase my-brand.json -o showcase.html
```

## Using the theme in a real app

The preview shows the tokens; to use them in an actual shadcn/ui project:

```bash
npx shadcn-theming apply my-brand.json          # patch the app's globals.css
# — or make it shareable —
npx shadcn-theming registry my-brand.json -o my-theme.json
npx shadcn@latest add https://.../my-theme.json # anyone installs it
```
