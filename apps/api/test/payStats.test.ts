import { describe, expect, it } from 'vitest';
import { analysePayGroup, earnerCount, summariseByRole } from '../src/domain/payStats';

describe('analysePayGroup: summary', () => {
  // Expected values worked out by hand.
  it.each([
    {
      name: 'an odd count: the median is the middle salary',
      salaries: [100, 200, 600],
      summary: { headcount: 3, min: 100, max: 600, average: 300, median: 200, spreadAmount: 500, spreadRatio: 6 },
    },
    {
      name: 'an even count: the median is the mean of the two middle salaries',
      salaries: [100, 200, 300, 1000],
      summary: { headcount: 4, min: 100, max: 1000, average: 400, median: 250, spreadAmount: 900, spreadRatio: 10 },
    },
    {
      name: 'a group of one: no spread',
      salaries: [500],
      summary: { headcount: 1, min: 500, max: 500, average: 500, median: 500, spreadAmount: 0, spreadRatio: 1 },
    },
    {
      name: 'averages and medians are not rounded',
      salaries: [1, 2],
      summary: { headcount: 2, min: 1, max: 2, average: 1.5, median: 1.5, spreadAmount: 1, spreadRatio: 2 },
    },
  ])('$name', ({ salaries, summary }) => {
    expect(analysePayGroup(salaries).summary).toEqual(summary);
  });
});

describe('analysePayGroup: refuses input it cannot trust', () => {
  it.each([
    { name: 'an empty pay group', salaries: [] },
    { name: 'salaries not sorted ascending (a missing ORDER BY)', salaries: [200, 100] },
    { name: 'a salary of zero', salaries: [0, 100] },
    { name: 'a negative salary', salaries: [-5, 100] },
    { name: 'a fractional salary', salaries: [100, 150.5] },
  ])('throws a RangeError for $name', ({ salaries }) => {
    expect(() => analysePayGroup(salaries)).toThrow(RangeError);
  });
});

describe('summariseByRole', () => {
  it('summarises each role from rows sorted by role, then salary', () => {
    const rows = [
      { roleId: 1, annualCtc: 100 },
      { roleId: 1, annualCtc: 300 },
      // A new role may start lower than the previous one ended.
      { roleId: 4, annualCtc: 50 },
    ];

    expect(summariseByRole(rows)).toEqual([
      { roleId: 1, summary: { headcount: 2, min: 100, max: 300, average: 200, median: 200, spreadAmount: 200, spreadRatio: 3 } },
      { roleId: 4, summary: { headcount: 1, min: 50, max: 50, average: 50, median: 50, spreadAmount: 0, spreadRatio: 1 } },
    ]);
  });

  it('returns nothing for a country with no employees', () => {
    expect(summariseByRole([])).toEqual([]);
  });

  it.each([
    { name: 'roles out of order', rows: [{ roleId: 4, annualCtc: 100 }, { roleId: 1, annualCtc: 200 }] },
    { name: 'salaries out of order within a role', rows: [{ roleId: 1, annualCtc: 300 }, { roleId: 1, annualCtc: 100 }] },
  ])('throws a RangeError for $name', ({ rows }) => {
    expect(() => summariseByRole(rows)).toThrow(RangeError);
  });
});

describe('analysePayGroup: histogram', () => {
  const counts = (salaries: number[]) => analysePayGroup(salaries).histogram.map((b) => b.count);

  it('splits min..max into 10 equal-width buckets, each holding salaries from its lower bound up to its upper', () => {
    // min 100, max 1000: width 90, so the buckets start at 100, 190, 280, …, 910.
    const { histogram } = analysePayGroup([100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]);

    expect(histogram.map((b) => [b.lower, b.upper])).toEqual([
      [100, 190], [190, 280], [280, 370], [370, 460], [460, 550],
      [550, 640], [640, 730], [730, 820], [820, 910], [910, 1000],
    ]);
    expect(histogram.map((b) => b.count)).toEqual([1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
  });

  it('puts a salary on a boundary in the bucket that starts there, and max in the last bucket', () => {
    expect(counts([100, 190, 1000])).toEqual([1, 1, 0, 0, 0, 0, 0, 0, 0, 1]);
  });

  it('keeps max in the last bucket even when the width is not a round number', () => {
    // width 0.3 is not exact in floating point.
    expect(counts([1, 4])).toEqual([1, 0, 0, 0, 0, 0, 0, 0, 0, 1]);
  });

  it('uses a single bucket when everyone earns the same', () => {
    expect(analysePayGroup([500, 500, 500]).histogram).toEqual([{ lower: 500, upper: 500, count: 3 }]);
  });

  it('counts every salary exactly once', () => {
    const salaries = [101, 150, 151, 333, 334, 335, 700, 701, 999, 1000, 1000];
    expect(counts(salaries).reduce((a, b) => a + b, 0)).toBe(salaries.length);
  });
});

describe('earnerCount', () => {
  // How many people each of the top and bottom lists shows. Worked by hand.
  it.each([
    { headcount: 7, percent: 5, count: 1, why: '0.35 rounds up to 1' },
    { headcount: 25, percent: 10, count: 3, why: '2.5 rounds up to 3' },
    { headcount: 1000, percent: 1, count: 10, why: 'exactly 10' },
    { headcount: 10, percent: 50, count: 5, why: 'exactly half' },
    { headcount: 3, percent: 50, count: 1, why: '1.5 rounds up to 2, capped at half the group (1)' },
    { headcount: 5, percent: 50, count: 2, why: '2.5 rounds up to 3, capped at half the group (2)' },
    { headcount: 2, percent: 50, count: 1, why: 'one at each end' },
    { headcount: 1, percent: 1, count: 1, why: 'a group of one: the same person is top and bottom' },
    { headcount: 1, percent: 50, count: 1, why: 'a group of one, whatever the percentage' },
  ])('$percent% of $headcount → $count ($why)', ({ headcount, percent, count }) => {
    expect(earnerCount(headcount, percent)).toBe(count);
  });

  it.each([
    { headcount: 10, percent: 0 },
    { headcount: 10, percent: 51 },
    { headcount: 10, percent: 12.5 },
    { headcount: 0, percent: 10 },
    { headcount: 2.5, percent: 10 },
  ])('throws a RangeError for $percent% of $headcount', ({ headcount, percent }) => {
    expect(() => earnerCount(headcount, percent)).toThrow(RangeError);
  });
});
