# Demo sandbox

`index.html` is a **self-contained preview** of the example [`../examples/acme.brand.json`](../examples/acme.brand.json)
theme — no build step, no dependencies. Open it in any browser and click
**Toggle theme** to check light and dark.

It renders shadcn-flavored component mockups (buttons, card, input, badges,
alert, chart palette) styled entirely with the generated OKLCH tokens, so it
doubles as a visual regression surface.

## Regenerate it for any brand

```bash
# from the repo root
npm run cli -- preview examples/acme.brand.json -o demo/index.html

# or for your own brand
npx shadcn-theming preview my-brand.json -o preview.html
```

## Using the theme in a real app

The preview shows the tokens; to use them in an actual shadcn/ui project:

```bash
npx shadcn-theming apply my-brand.json          # patch the app's globals.css
# — or make it shareable —
npx shadcn-theming registry my-brand.json -o my-theme.json
npx shadcn@latest add https://.../my-theme.json # anyone installs it
```
