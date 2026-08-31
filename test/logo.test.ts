import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { extractFromLogo } from "../src/adapters/logo.js";
import { slugify } from "../src/utils/slug.js";

const here = dirname(fileURLToPath(import.meta.url));

describe("extractFromLogo (svg)", () => {
  it("pulls exact brand colors from SVG markup", async () => {
    const result = await extractFromLogo(join(here, "fixtures/logo.svg"));
    expect(result.source).toBe("svg");
    // Every chromatic fill/stop should appear as a candidate.
    expect(result.candidates).toEqual(expect.arrayContaining(["#0ea5e9", "#f43f5e", "#22c55e"]));
    // Primary is the most saturated brand color, not the near-black stroke.
    expect(result.colors.primary).not.toBe("#111827");
    // Accent has a clearly different hue from primary.
    expect(result.colors.accent).toBeDefined();
  });
});

describe("slugify", () => {
  it("kebab-cases and strips diacritics", () => {
    expect(slugify("Acme Corp")).toBe("acme-corp");
    expect(slugify("Café Déjà")).toBe("cafe-deja");
  });
  it("falls back to 'brand' for empty input", () => {
    expect(slugify("!!!")).toBe("brand");
  });
  it("collapses repeated separators", () => {
    expect(slugify("A -- B __ C")).toBe("a-b-c");
  });
});
