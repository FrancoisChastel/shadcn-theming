# Contributing to shadcn-theming

Thanks for your interest! This project turns a brand definition into a
contrast-safe shadcn/ui theme. Contributions of all sizes are welcome.

## Development setup

```bash
git clone https://github.com/FrancoisChastel/shadcn-theming.git
cd shadcn-theming
npm install
```

Common tasks:

| Command | Purpose |
| --- | --- |
| `npm run cli -- <args>` | Run the CLI from TypeScript source (via tsx). |
| `npm test` | Run the vitest suite. |
| `npm run test:cov` | Run tests with coverage (thresholds enforced). |
| `npm run typecheck` | `tsc --noEmit`. |
| `npm run build` | Bundle to `dist/` with tsup. |

## Project layout

```
src/
  core/       color math, token derivation, css patch, registry, audit, preview
  adapters/   logo · website · design-tokens → brand.json
  commands/   one file per CLI command
  cli.ts      commander wiring
  index.ts    public programmatic API
skills/       the Agent Skill (SKILL.md + references)
registry/     extension components as shadcn registry items
test/         vitest specs (mirror src/core)
```

## Guidelines

- **Keep the core deterministic and pure.** `src/core/*` should be free of I/O
  and side effects (except the CSS patcher's string work). This is what makes
  the output testable and reproducible.
- **OKLCH everywhere.** Use the helpers in `src/core/color.ts`; don't hand-roll
  color math.
- **Preserve shadcn conventions.** Token names, ordering, and the dark
  alpha-white `border`/`input` values must match upstream.
- **Add tests** for any new derivation rule, adapter, or command behavior.
  Coverage thresholds are enforced in CI.
- **Type strictly.** No `any` in application code; validate external input with
  the zod schema.
- **Small files, clear names.** Match the surrounding style.

## Pull requests

1. Branch from `main`.
2. Make sure `npm run typecheck`, `npm test`, and `npm run build` pass.
3. Use [Conventional Commits](https://www.conventionalcommits.org/)
   (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`).
4. Describe the change and, for visual/theme changes, include a before/after
   preview (`npx shadcn-theming preview brand.json`).

By contributing you agree your work is licensed under the project's
[MIT License](LICENSE).
