import { describe, it, expect } from "vitest";
import { parseBrand } from "../src/core/brand-schema.js";
import { deriveTheme } from "../src/core/tokens.js";
import { patchGlobalsCss } from "../src/core/css-patch.js";
import { renderGlobalsCss } from "../src/core/render.js";
import { buildThemeRegistryItem } from "../src/core/registry.js";
import { COLOR_TOKENS } from "../src/core/tokens.js";

const tokens = deriveTheme(
  parseBrand({ name: "Patch Co", colors: { primary: "#4f46e5" }, fonts: { sans: "Inter" } }),
);

const EXISTING = `@import "tailwindcss";
@custom-variant dark (&:is(.dark *));
:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --primary: oklch(0.5 0 0);
  --my-token: 42px;
}
.dark {
  --background: oklch(0.145 0 0);
}
@theme inline {
  --color-background: var(--background);
}
`;

describe("patchGlobalsCss", () => {
  it("scaffolds a full stylesheet when input is empty", () => {
    const result = patchGlobalsCss("", tokens);
    expect(result.created).toBe(true);
    expect(result.css).toContain('@import "tailwindcss"');
    expect(result.css).toContain(":root");
    expect(result.css).toContain(".dark");
    expect(result.css).toContain("@theme inline");
  });

  it("updates values in place and preserves unmanaged declarations", () => {
    const { css } = patchGlobalsCss(EXISTING, tokens);
    expect(css).toContain("--my-token: 42px;"); // preserved
    expect(css).toMatch(/--primary: oklch\(0\.5106/); // updated to brand
    expect(css).toContain("--color-background: var(--background);"); // theme inline intact
  });

  it("inserts tokens that were missing from the original block", () => {
    const { css } = patchGlobalsCss(EXISTING, tokens);
    for (const key of COLOR_TOKENS) {
      expect(css, `missing --${key}`).toContain(`--${key}:`);
    }
  });

  it("is idempotent", () => {
    const first = patchGlobalsCss(EXISTING, tokens);
    const second = patchGlobalsCss(first.css, tokens);
    expect(second.css).toBe(first.css);
  });

  it("maps fonts into @theme inline", () => {
    const { css } = patchGlobalsCss(EXISTING, tokens);
    expect(css).toContain("--font-sans: var(--font-sans);");
  });

  it("warns and scaffolds when a non-empty file has no :root", () => {
    const result = patchGlobalsCss("body { color: red; }", tokens);
    expect(result.created).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});

describe("renderGlobalsCss", () => {
  it("includes all required Tailwind v4 sections", () => {
    const css = renderGlobalsCss(tokens);
    expect(css).toContain('@import "tailwindcss";');
    expect(css).toContain("@custom-variant dark");
    expect(css).toContain("@layer base");
    expect(css).toContain("--radius-lg: var(--radius);");
  });
});

describe("buildThemeRegistryItem", () => {
  it("produces a registry:theme with cssVars scopes and bare keys", () => {
    const item = buildThemeRegistryItem(
      parseBrand({ name: "Acme", colors: { primary: "#4f46e5" } }),
      tokens,
    );
    expect(item.type).toBe("registry:theme");
    expect(item.name).toBe("acme-theme");
    expect(item.cssVars.theme?.radius).toBeDefined();
    expect(item.cssVars.light?.primary).toMatch(/^oklch/);
    expect(item.cssVars.dark?.primary).toMatch(/^oklch/);
    // Keys must NOT carry the leading --
    expect(Object.keys(item.cssVars.light!).every((k) => !k.startsWith("--"))).toBe(true);
  });

  it("omits the dark scope for a light-only brand", () => {
    const lightOnly = deriveTheme(
      parseBrand({ name: "L", colors: { primary: "#4f46e5" }, appearance: "light" }),
    );
    const item = buildThemeRegistryItem(parseBrand({ name: "L", colors: { primary: "#4f46e5" } }), lightOnly);
    expect(item.cssVars.dark).toBeUndefined();
    expect(item.cssVars.light).toBeDefined();
  });
});
