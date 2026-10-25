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
  if (sortedSalaries.length === 0) throw new RangeError('A pay group needs at least one salary');
  assertSortedSalaries(sortedSalaries);
  return { summary: summarise(sortedSalaries) };
}

/**
 * Sorting is the database's job; this checks it in one pass rather than trusting it,
 * so a missing ORDER BY fails loudly instead of producing a wrong median.
 */
function assertSortedSalaries(salaries: readonly number[]): void {
  salaries.forEach((salary, i) => {
    if (!Number.isInteger(salary) || salary <= 0) {
      throw new RangeError(`Annual CTC must be a positive integer, got ${salary}`);
    }
    if (i > 0 && salary < salaries[i - 1]!) throw new RangeError('Salaries must be sorted ascending');
  });
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
