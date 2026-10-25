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

/** Bucket [lower, upper): includes its lower bound, excludes its upper, except the last, which includes max. */
export interface HistogramBucket {
  lower: number;
  upper: number;
  count: number;
}

const BUCKETS = 10;

/** Summarises one pay group and buckets its salaries, given its annual CTCs sorted ascending. */
export function analysePayGroup(sortedSalaries: readonly number[]): { summary: PaySummary; histogram: HistogramBucket[] } {
  if (sortedSalaries.length === 0) throw new RangeError('A pay group needs at least one salary');
  assertSortedSalaries(sortedSalaries);
  return { summary: summarise(sortedSalaries), histogram: histogram(sortedSalaries) };
}

function histogram(sorted: readonly number[]): HistogramBucket[] {
  const min = sorted[0]!;
  const max = sorted[sorted.length - 1]!;
  if (min === max) return [{ lower: min, upper: max, count: sorted.length }];

  const width = (max - min) / BUCKETS;
  const buckets = Array.from({ length: BUCKETS }, (_, i) => ({
    lower: min + i * width,
    upper: i === BUCKETS - 1 ? max : min + (i + 1) * width,
    count: 0,
  }));
  for (const salary of sorted) {
    // Clamp: max (and floating-point error near it) belongs in the last bucket.
    const index = Math.min(Math.floor((salary - min) / width), BUCKETS - 1);
    buckets[index]!.count++;
  }
  return buckets;
}

/**
 * One summary per role, given a country's (role, annual CTC) rows sorted by role and then
 * salary. Consecutive rows with the same role form one pay group.
 */
export function summariseByRole(
  rows: readonly { roleId: number; annualCtc: number }[],
): { roleId: number; summary: PaySummary }[] {
  const groups: { roleId: number; salaries: number[] }[] = [];
  for (const { roleId, annualCtc } of rows) {
    const current = groups.at(-1);
    if (current?.roleId === roleId) {
      current.salaries.push(annualCtc);
    } else {
      if (current && roleId < current.roleId) throw new RangeError('Rows must be sorted by role');
      groups.push({ roleId, salaries: [annualCtc] });
    }
  }
  return groups.map(({ roleId, salaries }) => ({ roleId, summary: analysePayGroup(salaries).summary }));
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
