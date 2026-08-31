# Color science: how a brand becomes a theme

All color work happens in **OKLCH** (the space Tailwind v4 and shadcn use), so
lightness changes are perceptually uniform and contrast reasoning is reliable.
The library used is `culori`.

## Derivation strategy: neutral scaffold + brand overlay

Rather than repainting every token, the generator starts from shadcn's neutral
gray ramp (background/card/muted/border/input) and overlays brand color only
where identity lives:

- `primary` (+ contrast-safe `primary-foreground`)
- `ring` — a mid tone of the brand hue, tying focus states to the brand
- `chart-1..5` — a palette rotated around the brand hue
- `sidebar-primary` — the brand
- `accent` — a light wash of the brand accent (subtle hover/active), only if an
  accent is provided; otherwise neutral
- `destructive` — the brand's danger color, or a calibrated red

Optionally, `neutrals.tint` carries a whisper of brand chroma into every gray
for a cohesive, premium feel.

## Contrast-safe foregrounds (WCAG AA)

For each surface, the foreground is chosen to be legible:

1. Pick the higher-contrast of a near-white or near-black candidate (subtly
   tinted toward the surface hue for cohesion).
2. If it still misses **4.5:1** (AA body text), `ensureContrast` searches
   lightness outward in both directions — reaching pure black/white when a
   mid-lightness brand color demands it — and returns the closest compliant
   tone.

If a pair *cannot* reach AA (e.g. a mid-luminance saturated red as a button
fill sits near the 4.5 knife-edge), that's a signal the brand color is being
asked to do a job it's not suited for. Surface it and suggest nudging the
primary's lightness rather than silently shipping low contrast.

UI-only pairs (focus `ring` on background) target 3:1, not 4.5.

## Dark-mode brand vibrancy

A dark navy primary that looks great in light mode reads as a muddy, low-contrast
button on a dark page. In dark mode the generator raises the primary's lightness
(to ~0.62–0.74) while keeping hue, gamut-mapping back into sRGB. This matches how
brands present brighter accents on dark UIs.

## Gamut mapping

Brand hues at high chroma can fall outside sRGB. Every derived color is passed
through `clampChroma(..., 'oklch')` so it renders identically across browsers
instead of being clipped differently by each engine.

## Tonal scales from one seed (if you need more stops)

Hold hue (and roughly chroma), sweep lightness across stops, and `clampChroma`
each. `culori`'s `interpolate([light, dark], 'oklch')` gives a quick ramp. For
Material-style tonal palettes from a single seed, `@material/material-color-utilities`
(HCT) is an alternative, but OKLCH keeps you in shadcn's own space.

## APCA (optional)

WCAG 2.x contrast is what shadcn/AA compliance is measured against and what this
tool checks. For the newer, size/weight-aware **APCA** model, add `apca-w3`
(`APCAcontrast(text, bg)`); `culori` does not ship APCA.
