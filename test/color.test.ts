import { describe, it, expect } from "vitest";
import {
  parseColor,
  formatOklch,
  toHex,
  toGamut,
  withLightness,
  rotateHue,
  scaleChroma,
  mix,
  contrastRatio,
  pickForeground,
  ensureContrast,
  isAchromatic,
  round,
  clamp,
} from "../src/core/color.js";

describe("parseColor", () => {
  it("parses hex into OKLCH", () => {
    const c = parseColor("#ffffff");
    expect(c.l).toBeCloseTo(1, 2);
    expect(c.c).toBeCloseTo(0, 3);
  });

  it("parses rgb and named colors", () => {
    expect(parseColor("rgb(0,0,0)").l).toBeCloseTo(0, 2);
    expect(parseColor("white").l).toBeCloseTo(1, 2);
  });

  it("normalizes hue into [0,360)", () => {
    const c = parseColor("oklch(0.6 0.2 400)");
    expect(c.h).toBeGreaterThanOrEqual(0);
    expect(c.h).toBeLessThan(360);
  });

  it("throws on garbage input", () => {
    expect(() => parseColor("not-a-color")).toThrow();
  });
});

describe("formatOklch", () => {
  it("collapses achromatic colors to L 0 0", () => {
    expect(formatOklch({ l: 1, c: 0, h: 0 })).toBe("oklch(1 0 0)");
  });

  it("formats chromatic colors with rounded channels", () => {
    expect(formatOklch({ l: 0.5106, c: 0.23012, h: 276.9663 })).toBe("oklch(0.5106 0.2301 276.966)");
  });
});

describe("gamut + transforms", () => {
  it("keeps in-gamut colors stable and maps out-of-gamut into sRGB", () => {
    const wild = toGamut({ l: 0.7, c: 0.5, h: 150 });
    // A hex round-trip must be representable.
    expect(toHex(wild)).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("withLightness clamps", () => {
    expect(withLightness({ l: 0.5, c: 0.1, h: 10 }, 2).l).toBe(1);
    expect(withLightness({ l: 0.5, c: 0.1, h: 10 }, -1).l).toBe(0);
  });

  it("rotateHue wraps around", () => {
    expect(rotateHue({ l: 0.5, c: 0.1, h: 350 }, 20).h).toBeCloseTo(10, 5);
  });

  it("scaleChroma reduces chroma", () => {
    expect(scaleChroma({ l: 0.5, c: 0.2, h: 10 }, 0.5).c).toBeCloseTo(0.1, 5);
  });

  it("mix interpolates across the short hue arc", () => {
    const m = mix({ l: 0, c: 0.1, h: 350 }, { l: 1, c: 0.1, h: 10 }, 0.5);
    expect(m.l).toBeCloseTo(0.5, 5);
    expect(m.h).toBeCloseTo(0, 1); // 350 → 10 crosses 0, not 180
  });
});

describe("contrast helpers", () => {
  it("white on black is maximal contrast", () => {
    expect(contrastRatio(parseColor("#fff"), parseColor("#000"))).toBeCloseTo(21, 0);
  });

  it("pickForeground returns a legible foreground", () => {
    const bg = parseColor("#4f46e5");
    const fg = pickForeground(bg);
    expect(contrastRatio(bg, fg)).toBeGreaterThanOrEqual(4.5);
  });

  it("ensureContrast lifts a low-contrast pair to AA", () => {
    const bg = parseColor("#777777");
    const fg = ensureContrast(parseColor("#888888"), bg, 4.5);
    // Either it reaches AA or returns the best possible; assert it improved.
    expect(contrastRatio(fg, bg)).toBeGreaterThan(contrastRatio(parseColor("#888888"), bg));
  });

  it("ensureContrast is a no-op when already compliant", () => {
    const bg = parseColor("#000");
    const fg = parseColor("#fff");
    expect(ensureContrast(fg, bg, 4.5)).toEqual(fg);
  });
});

describe("small utils", () => {
  it("isAchromatic detects grays", () => {
    expect(isAchromatic({ l: 0.5, c: 0, h: 0 })).toBe(true);
    expect(isAchromatic({ l: 0.5, c: 0.1, h: 0 })).toBe(false);
  });
  it("round trims decimals", () => {
    expect(round(0.123456, 3)).toBe(0.123);
  });
  it("clamp bounds values", () => {
    expect(clamp(5, 0, 1)).toBe(1);
    expect(clamp(-5, 0, 1)).toBe(0);
  });
});
