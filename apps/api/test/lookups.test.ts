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

  it('returns the five departments and each role with the department it belongs to', async () => {
    const { caller } = await makeCaller();

    const { departments, roles } = await caller.lookups.all();

    expect(departments.map((d) => d.name).sort()).toEqual(['Engineering', 'Finance', 'People', 'Product', 'Sales']);
    const departmentOf = (roleName: string) => roles.find((r) => r.name === roleName)?.department.name;
    expect(departmentOf('Software Engineer')).toBe('Engineering');
    expect(departmentOf('Product Manager')).toBe('Product');
    expect(departmentOf('Account Executive')).toBe('Sales');
    expect(departmentOf('Financial Analyst')).toBe('Finance');
    expect(departmentOf('Recruiter')).toBe('People');
  });
});
