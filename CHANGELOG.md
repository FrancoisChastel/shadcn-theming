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

[Unreleased]: https://github.com/FrancoisChastel/shadcn-theming/commits/main
