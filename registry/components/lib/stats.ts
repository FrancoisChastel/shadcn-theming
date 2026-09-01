/**
 * Small, dependency-free statistics + scale helpers powering the scientific
 * chart components. Pure functions only — safe to unit test and to bundle into
 * any project as a shadcn `registry:lib` item.
 */

/** Arithmetic mean. */
export function mean(xs: number[]): number {
  if (xs.length === 0) return NaN;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

/** Standard deviation. Sample (n-1) by default; population when sample=false. */
export function std(xs: number[], sample = true): number {
  const n = xs.length;
  if (n < 2) return 0;
  const m = mean(xs);
  const ss = xs.reduce((a, b) => a + (b - m) ** 2, 0);
  return Math.sqrt(ss / (sample ? n - 1 : n));
}

/** Linear-interpolated quantile of an already-sorted ascending array. */
export function quantileSorted(sorted: number[], q: number): number {
  const n = sorted.length;
  if (n === 0) return NaN;
  if (n === 1) return sorted[0]!;
  const pos = (n - 1) * Math.min(Math.max(q, 0), 1);
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  const frac = pos - lo;
  return sorted[lo]! + (sorted[hi]! - sorted[lo]!) * frac;
}

export interface BoxStats {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  iqr: number;
  /** Whisker ends (Tukey 1.5·IQR, clamped to data range). */
  lowerWhisker: number;
  upperWhisker: number;
  outliers: number[];
}

/** Tukey box-plot statistics with 1.5·IQR whiskers and outliers. */
export function boxStats(values: number[]): BoxStats {
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = quantileSorted(sorted, 0.25);
  const median = quantileSorted(sorted, 0.5);
  const q3 = quantileSorted(sorted, 0.75);
  const iqr = q3 - q1;
  const lowerFence = q1 - 1.5 * iqr;
  const upperFence = q3 + 1.5 * iqr;
  const inRange = sorted.filter((v) => v >= lowerFence && v <= upperFence);
  const outliers = sorted.filter((v) => v < lowerFence || v > upperFence);
  return {
    min: sorted[0] ?? NaN,
    q1,
    median,
    q3,
    max: sorted[sorted.length - 1] ?? NaN,
    iqr,
    lowerWhisker: inRange[0] ?? q1,
    upperWhisker: inRange[inRange.length - 1] ?? q3,
    outliers,
  };
}

/** Min/max of an array as a tuple. */
export function extent(xs: number[]): [number, number] {
  let min = Infinity;
  let max = -Infinity;
  for (const x of xs) {
    if (x < min) min = x;
    if (x > max) max = x;
  }
  return [min, max];
}

export interface Regression {
  slope: number;
  intercept: number;
  /** Coefficient of determination. */
  r2: number;
  /** Residual standard error. */
  se: number;
  n: number;
  meanX: number;
  ssX: number;
  predict: (x: number) => number;
  /** Standard error of the mean response at x (for a confidence band). */
  seMean: (x: number) => number;
}

/** Ordinary least-squares linear regression with band-ready standard errors. */
export function linearRegression(xs: number[], ys: number[]): Regression {
  const n = Math.min(xs.length, ys.length);
  const mx = mean(xs);
  const my = mean(ys);
  let sxy = 0;
  let sxx = 0;
  for (let i = 0; i < n; i++) {
    sxy += (xs[i]! - mx) * (ys[i]! - my);
    sxx += (xs[i]! - mx) ** 2;
  }
  const slope = sxx === 0 ? 0 : sxy / sxx;
  const intercept = my - slope * mx;
  const predict = (x: number) => intercept + slope * x;

  let ssRes = 0;
  let ssTot = 0;
  for (let i = 0; i < n; i++) {
    ssRes += (ys[i]! - predict(xs[i]!)) ** 2;
    ssTot += (ys[i]! - my) ** 2;
  }
  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot;
  const se = n > 2 ? Math.sqrt(ssRes / (n - 2)) : 0;
  const seMean = (x: number) =>
    sxx === 0 ? 0 : se * Math.sqrt(1 / n + (x - mx) ** 2 / sxx);

  return { slope, intercept, r2, se, n, meanX: mx, ssX: sxx, predict, seMean };
}

/** Silverman's rule-of-thumb KDE bandwidth. */
export function silvermanBandwidth(xs: number[]): number {
  const n = xs.length;
  if (n < 2) return 1;
  const s = std(xs);
  const sorted = [...xs].sort((a, b) => a - b);
  const iqr = quantileSorted(sorted, 0.75) - quantileSorted(sorted, 0.25);
  const sigma = iqr > 0 ? Math.min(s, iqr / 1.349) : s || 1;
  return 1.06 * sigma * n ** (-1 / 5) || 1;
}

/** Gaussian kernel density estimator. Returns a density function of x. */
export function gaussianKDE(
  xs: number[],
  bandwidth = silvermanBandwidth(xs),
): (x: number) => number {
  const h = bandwidth || 1;
  const n = xs.length;
  const norm = 1 / (n * h * Math.sqrt(2 * Math.PI));
  return (x: number) => {
    let sum = 0;
    for (const xi of xs) {
      const u = (x - xi) / h;
      sum += Math.exp(-0.5 * u * u);
    }
    return norm * sum;
  };
}

export interface Bin {
  x0: number;
  x1: number;
  count: number;
  /** count / (n · binWidth) — integrates to 1. */
  density: number;
}

/** Histogram bins. Bin count defaults to the Freedman–Diaconis-ish sqrt rule. */
export function histogramBins(xs: number[], binCount?: number): Bin[] {
  if (xs.length === 0) return [];
  const [min, max] = extent(xs);
  const k = binCount ?? Math.max(1, Math.ceil(Math.sqrt(xs.length)));
  const width = (max - min) / k || 1;
  const bins: Bin[] = Array.from({ length: k }, (_, i) => ({
    x0: min + i * width,
    x1: min + (i + 1) * width,
    count: 0,
    density: 0,
  }));
  for (const x of xs) {
    let idx = Math.floor((x - min) / width);
    if (idx >= k) idx = k - 1;
    if (idx < 0) idx = 0;
    bins[idx]!.count += 1;
  }
  for (const b of bins) b.density = b.count / (xs.length * width);
  return bins;
}

/** Pearson correlation coefficient. */
export function pearson(xs: number[], ys: number[]): number {
  const n = Math.min(xs.length, ys.length);
  const mx = mean(xs);
  const my = mean(ys);
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i]! - mx;
    const dy = ys[i]! - my;
    sxy += dx * dy;
    sxx += dx * dx;
    syy += dy * dy;
  }
  const denom = Math.sqrt(sxx * syy);
  return denom === 0 ? 0 : sxy / denom;
}

/** Pairwise Pearson correlation matrix for a set of equal-length columns. */
export function correlationMatrix(columns: number[][]): number[][] {
  const k = columns.length;
  const m: number[][] = Array.from({ length: k }, () => new Array<number>(k).fill(0));
  for (let i = 0; i < k; i++) {
    for (let j = i; j < k; j++) {
      const r = i === j ? 1 : pearson(columns[i]!, columns[j]!);
      m[i]![j] = r;
      m[j]![i] = r;
    }
  }
  return m;
}

/** A linear scale mapping a numeric domain onto a pixel range. */
export function linearScale(
  domain: [number, number],
  range: [number, number],
): (x: number) => number {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0 || 1;
  return (x: number) => r0 + ((x - d0) / span) * (r1 - r0);
}

/** "Nice", human-friendly tick values spanning [min, max]. */
export function niceTicks(min: number, max: number, count = 5): number[] {
  if (min === max) return [min];
  const span = max - min;
  const step0 = span / Math.max(1, count);
  const mag = 10 ** Math.floor(Math.log10(step0));
  const norm = step0 / mag;
  const step = (norm >= 7.5 ? 10 : norm >= 3.5 ? 5 : norm >= 1.5 ? 2 : 1) * mag;
  const start = Math.ceil(min / step) * step;
  const ticks: number[] = [];
  for (let t = start; t <= max + step * 1e-9; t += step) {
    // Guard against floating point crumbs.
    ticks.push(Math.abs(t) < step * 1e-9 ? 0 : Number(t.toFixed(10)));
  }
  return ticks;
}
