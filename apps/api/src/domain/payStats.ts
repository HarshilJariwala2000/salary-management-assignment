/**
 * Pay statistics for pay groups (one country + one role). Pure, numbers only: the database
 * filters and sorts, this module calculates (D-011). Its interface is a stable test seam (D-007).
 * Figures are unrounded; rounding happens once, in the transport layer.
 */

export interface PaySummary {
  headcount: number;
  min: number;
  max: number;
  average: number;
  median: number;
  /** max − min */
  spreadAmount: number;
  /** max ÷ min */
  spreadRatio: number;
}

/** Summarises one pay group, given its annual CTCs sorted ascending. */
export function analysePayGroup(sortedSalaries: readonly number[]): { summary: PaySummary } {
  return { summary: summarise(sortedSalaries) };
}

function summarise(sorted: readonly number[]): PaySummary {
  const n = sorted.length;
  const min = sorted[0]!;
  const max = sorted[n - 1]!;
  const middle = Math.floor(n / 2);
  return {
    headcount: n,
    min,
    max,
    average: sorted.reduce((sum, s) => sum + s, 0) / n,
    median: n % 2 === 1 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2,
    spreadAmount: max - min,
    spreadRatio: max / min,
  };
}
