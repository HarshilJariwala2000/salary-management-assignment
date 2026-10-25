import { describe, expect, it } from 'vitest';
import { makeCaller } from './support/app';
import { employee, given } from './support/employees';

type Caller = Awaited<ReturnType<typeof makeCaller>>['caller'];

async function payGroup(caller: Caller, isoCode: string, roleName: string) {
  const { countries, roles } = await caller.lookups.all();
  return {
    countryId: countries.find((c) => c.isoCode === isoCode)!.id,
    roleId: roles.find((r) => r.name === roleName)!.id,
  };
}

describe('insights.roleDetail', () => {
  it('summarises and buckets only the chosen pay group, rounded', async () => {
    const { caller, dataSource } = await makeCaller();
    await given(dataSource, [
      employee({ fullName: 'Asha Rao', roleName: 'Software Engineer', annualCtc: 1_000_000 }),
      employee({ fullName: 'Ben Das', roleName: 'Software Engineer', annualCtc: 1_450_000 }),
      employee({ fullName: 'Chen Iyer', roleName: 'Software Engineer', annualCtc: 2_000_000 }),
      employee({ fullName: 'Dev Shah', roleName: 'Recruiter', annualCtc: 5_000_000 }),
      employee({ fullName: 'Fay Miller', countryIsoCode: 'US', roleName: 'Software Engineer', annualCtc: 50 }),
    ]);

    const detail = await caller.insights.roleDetail(await payGroup(caller, 'IN', 'Software Engineer'));

    // Worked by hand: average 1,483,333.33 rounds to 1,483,333; buckets are 100,000 wide.
    expect(detail.summary).toEqual({
      headcount: 3,
      min: 1_000_000,
      max: 2_000_000,
      average: 1_483_333,
      median: 1_450_000,
      spreadAmount: 1_000_000,
      spreadRatio: 2,
    });
    expect(detail.histogram.map((b) => b.count)).toEqual([1, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    expect(detail.histogram[4]).toEqual({ lower: 1_400_000, upper: 1_500_000, count: 1 });
    expect(detail).toMatchObject({
      country: { name: 'India', currencyCode: 'INR' },
      role: { name: 'Software Engineer' },
      department: { name: 'Engineering' },
    });
  });

  it('rounds bucket bounds to whole currency units', async () => {
    const { caller, dataSource } = await makeCaller();
    await given(dataSource, [
      employee({ fullName: 'Asha Rao', annualCtc: 100 }),
      employee({ fullName: 'Ben Das', annualCtc: 105 }),
    ]);

    const { histogram } = await caller.insights.roleDetail(await payGroup(caller, 'IN', 'Software Engineer'));

    // Width 0.5: the second bucket spans 100.5 to 101.
    expect(histogram[1]).toEqual({ lower: 101, upper: 101, count: 0 });
  });
});
