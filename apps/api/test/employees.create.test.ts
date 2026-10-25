import { describe, expect, it } from 'vitest';
import { makeCaller } from './support/app';

type Caller = Awaited<ReturnType<typeof makeCaller>>['caller'];

/** A valid create input for an Indian recruiter; override only what the test cares about. */
async function newEmployee(caller: Caller, overrides: Record<string, unknown> = {}) {
  const { countries, roles } = await caller.lookups.all();
  return {
    fullName: 'Asha Rao',
    email: 'asha.rao@acme.test',
    countryId: countries.find((c) => c.isoCode === 'IN')!.id,
    roleId: roles.find((r) => r.name === 'Recruiter')!.id,
    joiningDate: '2024-01-15',
    annualCtc: 1_200_000,
    ...overrides,
  };
}

describe('employees.create', () => {
  it('creates an employee with a current assignment, who then appears in the list', async () => {
    const { caller } = await makeCaller();

    const created = await caller.employees.create(await newEmployee(caller));

    expect(created).toEqual({
      id: expect.any(Number),
      fullName: 'Asha Rao',
      email: 'asha.rao@acme.test',
      joiningDate: '2024-01-15',
      annualCtc: 1_200_000,
      country: { id: expect.any(Number), name: 'India', isoCode: 'IN', currencyCode: 'INR' },
      role: { id: expect.any(Number), name: 'Recruiter' },
      department: { id: expect.any(Number), name: 'People' },
    });
    expect((await caller.employees.list({})).rows).toEqual([created]);
  });
});
