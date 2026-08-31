import { describe, it, expect } from "vitest";
import { parseBrand } from "../src/core/brand-schema.js";
import { deriveTheme, deriveAppearance, COLOR_TOKENS } from "../src/core/tokens.js";
import { auditTokens } from "../src/core/audit.js";

function brand(overrides: Record<string, unknown> = {}) {
  return parseBrand({ name: "Test", colors: { primary: "#4f46e5" }, ...overrides });
}

describe("deriveTheme", () => {
  it("emits every canonical token for both appearances", () => {
    const tokens = deriveTheme(brand());
    for (const app of ["light", "dark"] as const) {
      const map = tokens[app]!;
      for (const key of COLOR_TOKENS) {
        expect(map[key], `${app}.${key}`).toBeTruthy();
      }
    }
  });

  it("respects appearance: light only", () => {
    const tokens = deriveTheme(brand({ appearance: "light" }));
    expect(tokens.light).toBeDefined();
    expect(tokens.dark).toBeUndefined();
  });

  it("respects appearance: dark only", () => {
    const tokens = deriveTheme(brand({ appearance: "dark" }));
    expect(tokens.dark).toBeDefined();
    expect(tokens.light).toBeUndefined();
  });

  it("uses the shadcn alpha-white convention for dark border/input", () => {
    const tokens = deriveTheme(brand());
    expect(tokens.dark!.border).toBe("oklch(1 0 0 / 10%)");
    expect(tokens.dark!.input).toBe("oklch(1 0 0 / 15%)");
    // light border stays a solid neutral
    expect(tokens.light!.border).toMatch(/^oklch\(0\.9/);
  });

  it("tints neutrals toward the brand hue when requested", () => {
    const tinted = deriveAppearance(brand({ neutrals: { tint: true } }), "light");
    const untinted = deriveAppearance(brand({ neutrals: { tint: false } }), "light");
    // The muted neutral should carry chroma when tinted, none when not.
    expect(untinted.muted).toMatch(/ 0 0\)$/);
    expect(tinted.muted).not.toMatch(/ 0 0\)$/);
  });

  it("brightens the primary for dark mode vibrancy", () => {
    const tokens = deriveTheme(brand({ colors: { primary: "#1e1b4b" } })); // very dark indigo
    const lightL = Number(tokens.light!.primary.match(/oklch\(([0-9.]+)/)![1]);
    const darkL = Number(tokens.dark!.primary.match(/oklch\(([0-9.]+)/)![1]);
    expect(darkL).toBeGreaterThan(lightL);
  });

  it("carries fonts + radius into the theme", () => {
    const tokens = deriveTheme(brand({ radius: 1, fonts: { sans: "Inter" } }));
    expect(tokens.radius).toBe("1rem");
    expect(tokens.fonts?.sans).toBe("Inter");
  });
});

describe("generated themes pass contrast", () => {
  const seeds = ["#4f46e5", "#0ea5e9", "#e11d48", "#16a34a", "#f59e0b", "#111827", "#7c3aed"];
  for (const primary of seeds) {
    it(`AA for primary ${primary}`, () => {
      const tokens = deriveTheme(brand({ colors: { primary } }));
      for (const app of ["light", "dark"] as const) {
        const audit = auditTokens(tokens[app]!, app);
        const textFailures = audit.checks.filter(
          (c) => !c.passes && c.required >= 4.5,
        );
        expect(textFailures, `${app}: ${textFailures.map((f) => f.label).join(", ")}`).toHaveLength(0);
      }
    });
  }
});
