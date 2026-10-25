import type { HistogramBucket, PaySummary } from '../../domain/payStats';

/** Money rounds to whole currency units; the spread ratio to 2 decimal places. The only place figures are rounded. */
export function roundSummary(summary: PaySummary): PaySummary {
  return {
    ...summary,
    average: Math.round(summary.average),
    median: Math.round(summary.median),
    spreadRatio: Math.round(summary.spreadRatio * 100) / 100,
  };
}

export function roundHistogram(histogram: HistogramBucket[]): HistogramBucket[] {
  return histogram.map((b) => ({ ...b, lower: Math.round(b.lower), upper: Math.round(b.upper) }));
}
