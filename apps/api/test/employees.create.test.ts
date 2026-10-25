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

  it('trims the name and stores the email trimmed and lower-cased', async () => {
    const { caller } = await makeCaller();

    const created = await caller.employees.create(
      await newEmployee(caller, { fullName: '  Asha Rao ', email: '  Asha.Rao@ACME.test ' }),
    );

    expect(created).toMatchObject({ fullName: 'Asha Rao', email: 'asha.rao@acme.test' });
  });

  it.each([
    ['a blank name', { fullName: '   ' }],
    ['an invalid email', { email: 'not-an-email' }],
    ['an annual CTC of 0', { annualCtc: 0 }],
    ['a fractional annual CTC', { annualCtc: 1.5 }],
    ['an impossible date', { joiningDate: '2023-02-30' }],
  ])('rejects %s', async (_case, overrides) => {
    const { caller } = await makeCaller();

    await expect(caller.employees.create(await newEmployee(caller, overrides))).rejects.toMatchObject({
      code: 'BAD_REQUEST',
    });
  });

  it('rejects a joining date after today, naming the joiningDate field, but accepts today', async () => {
    const { caller } = await makeCaller({ today: '2026-06-30' });

    await expect(
      caller.employees.create(await newEmployee(caller, { joiningDate: '2026-07-01' })),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST', cause: { field: 'joiningDate' } });
    await expect(caller.employees.create(await newEmployee(caller, { joiningDate: '2026-06-30' }))).resolves.toBeDefined();
  });

  it.each([
    ['country', { countryId: 9999 }, 'countryId'],
    ['role', { roleId: 9999 }, 'roleId'],
  ])('rejects an unknown %s, naming the field', async (_what, overrides, field) => {
    const { caller } = await makeCaller();

    await expect(caller.employees.create(await newEmployee(caller, overrides))).rejects.toMatchObject({
      code: 'BAD_REQUEST',
      cause: { field },
    });
  });
});
