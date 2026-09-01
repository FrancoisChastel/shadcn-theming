# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Core**: brand → shadcn OKLCH token derivation (light + dark) with a neutral
  scaffold + brand overlay, optional neutral tinting, dark-mode primary
  vibrancy, and sRGB gamut mapping.
- **Contrast**: WCAG AA foreground pairing with two-direction lightness search;
  `audit` command with `--strict` for CI.
- **CSS patcher**: idempotent, surgical `:root` / `.dark` upserts that preserve
  unmanaged declarations; full `globals.css` scaffolding for fresh files.
- **Registry**: `registry:theme` emitter compatible with `npx shadcn add`.
- **Adapters**: extract a brand from a logo (SVG/raster), a website (static),
  or a design-tokens export (W3C / Tokens Studio).
- **CLI**: `init`, `extract`, `generate`, `apply`, `registry`, `preview`,
  `audit`.
- **Preview**: self-contained HTML preview of any theme (light + dark).
- **Agent Skill**: `skills/shadcn-theming` with reference docs, installable via
  `npx skills add`.
- **Extension components**: sparkline and stat-card shadcn registry items.
- **Scientific charts**: seaborn-like registry components (`histogram` w/ KDE,
  `box-plot`, `scatter-plot` w/ regression + CI band, `area-band` WEO fan chart,
  `correlation-heatmap`) over a shared, tested `stats` lib and `plot-frame`.
- **`showcase` command** + renderer: a full self-contained HTML page with every
  component and chart in a brand's theme.
- **IMF example**: `examples/imf.brand.json` (verified `#004C97`, real WEO chart
  palette, 3px radius) + prebuilt registry theme and showcase pages.

- **Component explorer**: `explore` command + a shadcn-website-style interactive
  gallery of every component (forms, overlays, menus, navigation, data display)
  in the brand theme, with a ⌘K command palette, dialogs, dropdowns, toasts, and
  live charts. Self-contained (no dependencies at view time).
- **Observable Plot charts**: the scientific charts are rendered with
  [Observable Plot](https://observablehq.com/plot/) — `linearRegressionY`
  (regression + confidence band), `boxY`, `binX` density, and `cell` heatmap —
  both as React registry components (`@observablehq/plot` + a `use-plot` hook)
  and, inlined with d3, in the self-contained showcase/explorer pages.

### Fixed

- Explicit `background`/`foreground` are now applied only to the appearance they
  tonally suit, so a light-mode background/foreground no longer breaks dark-mode
  contrast.

[Unreleased]: https://github.com/FrancoisChastel/shadcn-theming/commits/main
