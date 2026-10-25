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

  it('returns not-found for an empty pay group or one that does not exist', async () => {
    const { caller, dataSource } = await makeCaller();
    await given(dataSource, [employee({ countryIsoCode: 'IN', roleName: 'Software Engineer' })]);
    const indianRecruiters = await payGroup(caller, 'IN', 'Recruiter');

    await expect(caller.insights.roleDetail(indianRecruiters)).rejects.toMatchObject({ code: 'NOT_FOUND' });
    await expect(caller.insights.roleDetail({ ...indianRecruiters, roleId: 9999 })).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('lists the bottom and top x% by salary, breaking ties by employee id, with each one’s difference from the median', async () => {
    const { caller, dataSource } = await makeCaller();
    await given(dataSource, [
      employee({ fullName: 'Asha Rao', annualCtc: 1_000_000 }),
      employee({ fullName: 'Ben Das', annualCtc: 1_000_000 }),
      employee({ fullName: 'Chen Iyer', annualCtc: 1_500_000 }),
      employee({ fullName: 'Dev Shah', annualCtc: 2_000_000 }),
      employee({ fullName: 'Esha Nair', annualCtc: 2_000_000 }),
      employee({ fullName: 'Fay Pillai', annualCtc: 2_500_000 }),
    ]);

    // 6 people, 20% → 1.2 rounds up to 2 at each end. Median = (1,500,000 + 2,000,000) / 2 = 1,750,000.
    const { bottom, top } = await caller.insights.roleDetail({ ...(await payGroup(caller, 'IN', 'Software Engineer')), percent: 20 });

    const earner = (fullName: string, annualCtc: number, differenceFromMedian: number) => ({
      id: expect.any(Number),
      fullName,
      annualCtc,
      joiningDate: '2024-01-15',
      differenceFromMedian,
    });
    // Ties: Asha and Ben both earn 1,000,000; Dev and Esha both 2,000,000. Lower id first, at both ends.
    expect(bottom).toEqual([earner('Asha Rao', 1_000_000, -750_000), earner('Ben Das', 1_000_000, -750_000)]);
    expect(top).toEqual([earner('Fay Pillai', 2_500_000, 750_000), earner('Dev Shah', 2_000_000, 250_000)]);
  });

  it('rounds differences from the median symmetrically, half away from zero', async () => {
    const { caller, dataSource } = await makeCaller();
    await given(dataSource, [employee({ fullName: 'Asha Rao', annualCtc: 100 }), employee({ fullName: 'Ben Das', annualCtc: 101 })]);

    // Median 100.5: Asha is 0.5 below it, Ben 0.5 above.
    const { bottom, top } = await caller.insights.roleDetail({ ...(await payGroup(caller, 'IN', 'Software Engineer')), percent: 50 });

    expect(bottom.map((e) => e.differenceFromMedian)).toEqual([-1]);
    expect(top.map((e) => e.differenceFromMedian)).toEqual([1]);
  });
});
