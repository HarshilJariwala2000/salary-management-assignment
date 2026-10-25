import { describe, expect, it } from 'vitest';
import { analysePayGroup } from '../src/domain/payStats';

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
