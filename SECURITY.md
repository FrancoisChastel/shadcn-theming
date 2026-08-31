# Security Policy

## Supported versions

This project is pre-1.0; security fixes land on the latest published `0.x`
release and `main`.

## Reporting a vulnerability

Please **do not** open a public issue for security problems.

Instead, report privately via GitHub's
[private vulnerability reporting](https://github.com/FrancoisChastel/shadcn-theming/security/advisories/new),
or email the maintainer at the address on their GitHub profile.

Include:

- a description of the issue and its impact,
- steps to reproduce (a minimal `brand.json`, logo, or URL if relevant),
- affected version(s).

You can expect an acknowledgement within a few business days. Once the issue is
confirmed and fixed, we'll coordinate a disclosure timeline with you.

## Scope notes

This is a build-time CLI, not a running service. The most relevant surfaces are:

- **`extract --website`** performs outbound HTTP requests to a URL you provide.
  It fetches HTML and a bounded number of stylesheets; it does not execute page
  JavaScript. Treat extracted output as untrusted and review before applying.
- **File writes** (`apply`) modify your project's `globals.css`. Use `--dry-run`
  to inspect the change first; commit your work beforehand.
