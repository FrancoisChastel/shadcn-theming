import { describe, it, expect } from "vitest";
import { importFromTokens } from "../src/adapters/tokens-import.js";
import { parseBrand, brandSchema } from "../src/core/brand-schema.js";

describe("brand-schema", () => {
  it("applies defaults", () => {
    const b = parseBrand({ colors: { primary: "#4f46e5" } });
    expect(b.name).toBe("Brand");
    expect(b.radius).toBe("0.625rem");
    expect(b.appearance).toBe("both");
    expect(b.neutrals.tint).toBe(false);
  });

  it("rejects an unparseable primary color", () => {
    const result = brandSchema.safeParse({ colors: { primary: "definitely-not-a-color" } });
    expect(result.success).toBe(false);
  });

  it("rejects unknown keys (strict)", () => {
    const result = brandSchema.safeParse({ colors: { primary: "#000" }, bogus: true });
    expect(result.success).toBe(false);
  });

  it("accepts numeric radius", () => {
    expect(parseBrand({ colors: { primary: "#000" }, radius: 0.5 }).radius).toBe(0.5);
  });
});

describe("importFromTokens", () => {
  it("reads W3C design tokens and resolves aliases", () => {
    const result = importFromTokens({
      color: {
        brand: { primary: { $value: "#7c3aed", $type: "color" } },
        semantic: { error: { $value: "{color.brand.primary}", $type: "color" } },
      },
      radius: { md: { $value: "12", $type: "dimension" } },
      font: { body: { $value: "Manrope", $type: "fontFamily" } },
    });
    expect(result.colors.primary).toBe("#7c3aed");
    expect(result.colors.destructive).toBe("#7c3aed"); // via alias
    expect(result.radius).toBe("12px");
    expect(result.fonts?.sans).toBe("Manrope");
  });

  it("reads Tokens Studio format (value/type)", () => {
    const result = importFromTokens({
      colors: { primary: { value: "#0ea5e9", type: "color" } },
    });
    expect(result.colors.primary).toBe("#0ea5e9");
  });

  it("throws when no primary/brand token exists", () => {
    expect(() =>
      importFromTokens({ colors: { neutral: { $value: "#888", $type: "color" } } }),
    ).toThrow();
  });

  it("normalizes a rem-suffixed radius as-is", () => {
    const result = importFromTokens({
      color: { primary: { $value: "#000", $type: "color" } },
      radii: { base: { $value: "0.5rem", $type: "dimension" } },
    });
    expect(result.radius).toBe("0.5rem");
  });
});
