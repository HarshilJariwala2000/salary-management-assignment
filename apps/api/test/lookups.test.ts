import { describe, expect, it } from 'vitest';
import { makeCaller } from './support/app';

describe('lookups.all', () => {
  it('returns the six countries, each with its currency code', async () => {
    const { caller } = await makeCaller();

    const { countries } = await caller.lookups.all();

    expect(countries.map((c) => [c.isoCode, c.currencyCode]).sort()).toEqual([
      ['BR', 'BRL'],
      ['DE', 'EUR'],
      ['GB', 'GBP'],
      ['IN', 'INR'],
      ['SG', 'SGD'],
      ['US', 'USD'],
    ]);
  });
});
