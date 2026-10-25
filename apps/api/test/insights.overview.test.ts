import { describe, expect, it } from 'vitest';
import { makeCaller } from './support/app';
import { employee, given, newEmployee } from './support/employees';

async function countryId(caller: Awaited<ReturnType<typeof makeCaller>>['caller'], isoCode: string) {
  return (await caller.lookups.all()).countries.find((c) => c.isoCode === isoCode)!.id;
}

describe('insights.countryOverview', () => {
  it('summarises each role in the country, rounded, without mixing in other countries', async () => {
    const { caller, dataSource } = await makeCaller();
    await given(dataSource, [
      employee({ fullName: 'Asha Rao', roleName: 'Software Engineer', annualCtc: 1_000_000 }),
      employee({ fullName: 'Ben Das', roleName: 'Software Engineer', annualCtc: 1_500_000 }),
      employee({ fullName: 'Chen Iyer', roleName: 'Software Engineer', annualCtc: 2_000_001 }),
      employee({ fullName: 'Dev Shah', roleName: 'Recruiter', annualCtc: 800_000 }),
      employee({ fullName: 'Esha Nair', roleName: 'Recruiter', annualCtc: 900_000 }),
      employee({ fullName: 'Fay Miller', countryIsoCode: 'US', roleName: 'Software Engineer', annualCtc: 120_000 }),
    ]);

    const overview = await caller.insights.countryOverview({ countryId: await countryId(caller, 'IN') });

    // Worked by hand. Engineers: average 1,500,000.33 rounds to 1,500,000; ratio 2.000001 rounds to 2.
    // Recruiters: ratio 900,000 / 800,000 = 1.125 rounds to 1.13.
    expect(overview).toEqual({
      country: { id: expect.any(Number), name: 'India', isoCode: 'IN', currencyCode: 'INR' },
      roles: [
        {
          role: { id: expect.any(Number), name: 'Recruiter' },
          department: { id: expect.any(Number), name: 'People' },
          summary: { headcount: 2, min: 800_000, max: 900_000, average: 850_000, median: 850_000, spreadAmount: 100_000, spreadRatio: 1.13 },
        },
        {
          role: { id: expect.any(Number), name: 'Software Engineer' },
          department: { id: expect.any(Number), name: 'Engineering' },
          summary: {
            headcount: 3,
            min: 1_000_000,
            max: 2_000_001,
            average: 1_500_000,
            median: 1_500_000,
            spreadAmount: 1_000_001,
            spreadRatio: 2,
          },
        },
      ],
    });
  });

  it('returns not-found for a country that does not exist, and no roles for a country without employees', async () => {
    const { caller } = await makeCaller();

    await expect(caller.insights.countryOverview({ countryId: 9999 })).rejects.toMatchObject({ code: 'NOT_FOUND' });
    expect((await caller.insights.countryOverview({ countryId: await countryId(caller, 'BR') })).roles).toEqual([]);
  });

  it('counts employees created through the API and reflects edited salaries (from tickets 04 and 05)', async () => {
    const { caller } = await makeCaller();
    const india = await countryId(caller, 'IN');
    const asha = await caller.employees.create(await newEmployee(caller, { annualCtc: 1_000_000 }));
    await caller.employees.create(await newEmployee(caller, { fullName: 'Ben Das', email: 'ben.das@acme.test', annualCtc: 2_000_000 }));

    expect((await caller.insights.countryOverview({ countryId: india })).roles[0]!.summary).toMatchObject({
      headcount: 2,
      min: 1_000_000,
      median: 1_500_000,
    });

    await caller.employees.update({ id: asha.id, ...(await newEmployee(caller, { annualCtc: 1_200_000 })) });

    expect((await caller.insights.countryOverview({ countryId: india })).roles[0]!.summary).toMatchObject({
      headcount: 2,
      min: 1_200_000,
      median: 1_600_000,
    });
  });
});
