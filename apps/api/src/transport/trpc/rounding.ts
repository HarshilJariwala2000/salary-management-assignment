import type { PaySummary } from '../../domain/payStats';

/** Money rounds to whole currency units; the spread ratio to 2 decimal places. The only place figures are rounded. */
export function roundSummary(summary: PaySummary): PaySummary {
  return {
    ...summary,
    average: Math.round(summary.average),
    median: Math.round(summary.median),
    spreadRatio: Math.round(summary.spreadRatio * 100) / 100,
  };
}
