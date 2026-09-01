import { describe, it, expect } from "vitest";
import {
  mean,
  std,
  quantileSorted,
  boxStats,
  linearRegression,
  gaussianKDE,
  histogramBins,
  pearson,
  correlationMatrix,
  linearScale,
  niceTicks,
} from "../registry/components/lib/stats.js";

describe("summary stats", () => {
  it("mean and std", () => {
    expect(mean([2, 4, 6])).toBe(4);
    expect(std([2, 4, 6])).toBeCloseTo(2, 5); // sample sd
  });

  it("quantileSorted interpolates", () => {
    const s = [1, 2, 3, 4, 5];
    expect(quantileSorted(s, 0.5)).toBe(3);
    expect(quantileSorted(s, 0.25)).toBe(2);
  });

  it("boxStats flags outliers via 1.5·IQR", () => {
    const b = boxStats([1, 2, 3, 4, 5, 6, 7, 8, 100]);
    expect(b.median).toBeGreaterThan(0);
    expect(b.outliers).toContain(100);
    expect(b.upperWhisker).toBeLessThan(100);
  });
});

describe("linearRegression", () => {
  it("recovers a known line y = 2x + 1 with r2 = 1", () => {
    const xs = [0, 1, 2, 3, 4];
    const ys = xs.map((x) => 2 * x + 1);
    const r = linearRegression(xs, ys);
    expect(r.slope).toBeCloseTo(2, 6);
    expect(r.intercept).toBeCloseTo(1, 6);
    expect(r.r2).toBeCloseTo(1, 6);
    expect(r.predict(10)).toBeCloseTo(21, 6);
  });

  it("has a wider confidence band away from mean(x)", () => {
    const xs = [0, 1, 2, 3, 4];
    const ys = [1.1, 2.9, 5.2, 6.8, 9.1];
    const r = linearRegression(xs, ys);
    expect(r.seMean(4)).toBeGreaterThan(r.seMean(r.meanX));
  });
});

describe("gaussianKDE", () => {
  it("peaks near a cluster center and integrates ~1", () => {
    const data = [-2, -1, -1, 0, 0, 0, 1, 1, 2];
    const kde = gaussianKDE(data);
    expect(kde(0)).toBeGreaterThan(kde(3));
    // numeric integral over a wide range ≈ 1
    let area = 0;
    const step = 0.05;
    for (let x = -8; x <= 8; x += step) area += kde(x) * step;
    expect(area).toBeGreaterThan(0.95);
    expect(area).toBeLessThan(1.05);
  });
});

describe("histogramBins", () => {
  it("counts sum to n and densities integrate to ~1", () => {
    const xs = Array.from({ length: 100 }, (_, i) => i / 10);
    const bins = histogramBins(xs, 10);
    expect(bins.reduce((a, b) => a + b.count, 0)).toBe(100);
    const width = bins[0]!.x1 - bins[0]!.x0;
    const area = bins.reduce((a, b) => a + b.density * width, 0);
    expect(area).toBeCloseTo(1, 6);
  });
});

describe("correlation", () => {
  it("pearson is 1 for a perfect positive line and -1 for negative", () => {
    expect(pearson([1, 2, 3], [2, 4, 6])).toBeCloseTo(1, 6);
    expect(pearson([1, 2, 3], [6, 4, 2])).toBeCloseTo(-1, 6);
  });
  it("correlationMatrix has unit diagonal and is symmetric", () => {
    const m = correlationMatrix([[1, 2, 3, 4], [2, 4, 6, 8], [4, 3, 2, 1]]);
    expect(m[0]![0]).toBeCloseTo(1, 6);
    expect(m[0]![1]).toBeCloseTo(m[1]![0]!, 6);
    expect(m[0]![2]).toBeCloseTo(-1, 6);
  });
});

describe("scales", () => {
  it("linearScale maps domain to range", () => {
    const s = linearScale([0, 10], [0, 100]);
    expect(s(5)).toBe(50);
    expect(s(10)).toBe(100);
  });
  it("niceTicks returns evenly spaced round numbers within range", () => {
    const ticks = niceTicks(0, 97, 5);
    expect(ticks[0]).toBe(0);
    expect(ticks.every((t) => t >= 0 && t <= 97)).toBe(true);
    // evenly spaced by a round step
    const step = ticks[1]! - ticks[0]!;
    expect(ticks.every((t, i) => i === 0 || Math.abs(t - ticks[i - 1]! - step) < 1e-9)).toBe(true);
    expect([2, 5, 10, 20, 25, 50].includes(step)).toBe(true);
  });
});
