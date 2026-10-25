import { describe, expect, it } from 'vitest';
import { makeCaller } from './support/app';
import { newEmployee } from './support/employees';

describe('employees.delete', () => {
  it('removes the employee for good: gone from the list, the lookup and the insights', async () => {
    const { caller } = await makeCaller();
    const asha = await caller.employees.create(await newEmployee(caller, { annualCtc: 1_000_000 }));
    const ben = await caller.employees.create(await newEmployee(caller, { fullName: 'Ben Das', email: 'ben.das@acme.test', annualCtc: 3_000_000 }));

    await caller.employees.delete({ id: asha.id });

    expect((await caller.employees.list({})).rows.map((e) => e.id)).toEqual([ben.id]);
    await expect(caller.employees.get({ id: asha.id })).rejects.toMatchObject({ code: 'NOT_FOUND' });
    const overview = await caller.insights.countryOverview({ countryId: asha.country.id });
    expect(overview.roles[0]!.summary).toMatchObject({ headcount: 1, min: 3_000_000 });
  });
});
