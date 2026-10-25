import type { HistogramBucket, PaySummary } from '../../domain/payStats';

/**
 * Whole currency units, rounding half away from zero so positive and negative amounts round
 * symmetrically (Math.round(-0.5) would give -0, Math.round(0.5) gives 1).
 */
export function roundMoney(amount: number): number {
  return Math.sign(amount) * Math.round(Math.abs(amount)) || 0;
}

/** Money rounds to whole currency units; the spread ratio to 2 decimal places. The only place figures are rounded. */
export function roundSummary(summary: PaySummary): PaySummary {
  return {
    ...summary,
    average: roundMoney(summary.average),
    median: roundMoney(summary.median),
    spreadRatio: Math.round(summary.spreadRatio * 100) / 100,
  };
}

export function roundHistogram(histogram: HistogramBucket[]): HistogramBucket[] {
  return histogram.map((b) => ({ ...b, lower: roundMoney(b.lower), upper: roundMoney(b.upper) }));
}
