# brand.json reference

The canonical brand definition. Every input source normalizes into this; token
derivation reads only this. Only `colors.primary` is required.

```jsonc
{
  "$schema": "https://raw.githubusercontent.com/FrancoisChastel/shadcn-theming/main/schema/brand.schema.json",
  "name": "Acme",                       // brand/company name (→ registry slug)
  "logo": "./acme-logo.svg",            // optional; used for extraction/preview
  "colors": {
    "primary": "#4f46e5",               // REQUIRED — the one anchor
    "secondary": "#64748b",             // optional; else derived neutral
    "accent": "#f97316",                // optional; else derived from primary
    "destructive": "#e11d48",           // optional; else calibrated red
    "background": "#ffffff",            // optional; else near-white/near-black
    "foreground": "#0a0a0a",            // optional; else contrast-safe default
    "ring": "#4f46e5"                   // optional; else mid tone of primary hue
  },
  "charts": ["#4f46e5", "#f97316"],     // optional explicit chart seeds (≤5)
  "neutrals": {
    "tint": true,                       // tint grays toward the brand hue
    "hue": 277,                         // optional override (defaults to primary hue)
    "strength": 0.004                   // chroma carried into neutrals (0..0.05)
  },
  "fonts": {
    "sans": "Inter, ui-sans-serif, system-ui, sans-serif",
    "serif": "Fraunces, ui-serif, Georgia, serif",
    "mono": "JetBrains Mono, ui-monospace, monospace"
  },
  "radius": "0.5rem",                    // CSS length or number of rem (default 0.625rem)
  "appearance": "both"                   // "light" | "dark" | "both"
}
```

Any CSS color is accepted for color fields (hex, `rgb()`, `hsl()`, `oklch()`,
named). They're normalized to OKLCH internally.

## Minimal example

```json
{ "name": "Acme", "colors": { "primary": "#4f46e5" } }
```

## Producing one

- `npx shadcn-theming extract --logo ./logo.svg -o brand.json`
- `npx shadcn-theming extract --website https://acme.com -o brand.json`
- `npx shadcn-theming extract --tokens ./tokens.json -o brand.json`
- `npx shadcn-theming init` (interactive; also applies + emits a registry theme)

Always read the generated `brand.json` back to the user and confirm before
applying — extraction is a starting point, not gospel.
