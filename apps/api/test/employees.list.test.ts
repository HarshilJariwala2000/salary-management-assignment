import { describe, expect, it } from 'vitest';
import { makeCaller } from './support/app';
import { employee, given, numberedEmployees } from './support/employees';

describe('employees.list', () => {
  it('pages through employees by name, 20 per page by default, with the total count', async () => {
    const { caller, dataSource } = await makeCaller();
    await given(dataSource, numberedEmployees(25));

    const firstPage = await caller.employees.list({});
    const lastPage = await caller.employees.list({ page: 3, pageSize: 10 });

    expect(firstPage.total).toBe(25);
    expect(firstPage.rows).toHaveLength(20);
    expect(firstPage.rows[0]!.fullName).toBe('Employee 01');
    expect(lastPage.rows.map((r) => r.fullName)).toEqual([
      'Employee 21',
      'Employee 22',
      'Employee 23',
      'Employee 24',
      'Employee 25',
    ]);
  });

  it('returns each employee with their country and currency, role and department', async () => {
    const { caller, dataSource } = await makeCaller();
    await given(dataSource, [
      employee({
        fullName: 'Asha Rao',
        email: 'asha.rao@acme.test',
        joiningDate: '2023-04-01',
        countryIsoCode: 'IN',
        roleName: 'Recruiter',
        annualCtc: 1_200_000,
      }),
    ]);

    const { rows } = await caller.employees.list({});

    expect(rows).toEqual([
      {
        id: expect.any(Number),
        fullName: 'Asha Rao',
        email: 'asha.rao@acme.test',
        joiningDate: '2023-04-01',
        annualCtc: 1_200_000,
        country: { id: expect.any(Number), name: 'India', isoCode: 'IN', currencyCode: 'INR' },
        role: { id: expect.any(Number), name: 'Recruiter' },
        department: { id: expect.any(Number), name: 'People' },
      },
    ]);
  });

  it.each([10, 20, 50, 100] as const)('accepts a page size of %i', async (pageSize) => {
    const { caller, dataSource } = await makeCaller();
    await given(dataSource, numberedEmployees(60));

    const { rows } = await caller.employees.list({ pageSize });

    expect(rows).toHaveLength(Math.min(pageSize, 60));
  });

  it('rejects any other page size', async () => {
    const { caller } = await makeCaller();

    // @ts-expect-error 25 is deliberately not an allowed page size
    await expect(caller.employees.list({ pageSize: 25 })).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });
});
