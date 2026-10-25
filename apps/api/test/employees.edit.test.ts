import { describe, expect, it } from 'vitest';
import { makeCaller } from './support/app';
import { newEmployee } from './support/employees';

describe('employees.get', () => {
  it('returns one employee by id, with their country, role and department', async () => {
    const { caller } = await makeCaller();
    const created = await caller.employees.create(await newEmployee(caller));

    expect(await caller.employees.get({ id: created.id })).toEqual(created);
  });

  it('returns not-found for an employee who does not exist', async () => {
    const { caller } = await makeCaller();

    await expect(caller.employees.get({ id: 9999 })).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});

describe('employees.update', () => {
  it('changes details, country, role and salary in place, without adding an employee', async () => {
    const { caller } = await makeCaller();
    const created = await caller.employees.create(await newEmployee(caller));
    const { countries, roles } = await caller.lookups.all();
    const germany = countries.find((c) => c.isoCode === 'DE')!;
    const productManager = roles.find((r) => r.name === 'Product Manager')!;

    const updated = await caller.employees.update({
      id: created.id,
      ...(await newEmployee(caller, {
        fullName: 'Asha R. Rao',
        email: 'asha.rr@acme.test',
        countryId: germany.id,
        roleId: productManager.id,
        joiningDate: '2023-09-01',
        annualCtc: 85_000,
      })),
    });

    expect(updated).toEqual({
      id: created.id,
      fullName: 'Asha R. Rao',
      email: 'asha.rr@acme.test',
      joiningDate: '2023-09-01',
      annualCtc: 85_000,
      country: { id: germany.id, name: 'Germany', isoCode: 'DE', currencyCode: 'EUR' },
      role: { id: productManager.id, name: 'Product Manager' },
      department: { id: expect.any(Number), name: 'Product' },
    });
    expect(await caller.employees.list({})).toEqual({ rows: [updated], total: 1 });
  });

  it('returns not-found for an employee who does not exist', async () => {
    const { caller } = await makeCaller();

    await expect(caller.employees.update({ id: 9999, ...(await newEmployee(caller)) })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('lets an employee keep their own email, but not take another employee’s', async () => {
    const { caller } = await makeCaller();
    const asha = await caller.employees.create(await newEmployee(caller, { email: 'asha.rao@acme.test' }));
    await caller.employees.create(await newEmployee(caller, { fullName: 'Ben Carter', email: 'ben.carter@acme.test' }));

    await expect(
      caller.employees.update({ id: asha.id, ...(await newEmployee(caller, { email: 'asha.rao@acme.test', annualCtc: 1_300_000 })) }),
    ).resolves.toMatchObject({ annualCtc: 1_300_000 });
    await expect(
      caller.employees.update({ id: asha.id, ...(await newEmployee(caller, { email: 'BEN.CARTER@acme.test' })) }),
    ).rejects.toMatchObject({ code: 'CONFLICT', cause: { field: 'email' } });
  });
});
