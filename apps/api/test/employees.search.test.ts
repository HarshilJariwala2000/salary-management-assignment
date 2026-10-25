import { describe, expect, it } from 'vitest';
import { makeCaller } from './support/app';
import { employee, given } from './support/employees';

async function names(listed: Promise<{ rows: { fullName: string }[] }>) {
  return (await listed).rows.map((r) => r.fullName);
}

describe('employees.list: search, filters and sorting', () => {
  it('searches any part of the name or email, ignoring case, treating % and _ literally', async () => {
    const { caller, dataSource } = await makeCaller();
    await given(dataSource, [
      employee({ fullName: 'Asha Rao', email: 'asha.rao@acme.test' }),
      employee({ fullName: 'Ben Carter', email: 'ben.carter@acme.test' }),
      employee({ fullName: 'Chen Wei', email: 'c.wei@acme.test' }),
    ]);

    expect(await names(caller.employees.list({ search: 'RAO' }))).toEqual(['Asha Rao']);
    expect(await names(caller.employees.list({ search: 'carter@' }))).toEqual(['Ben Carter']);
    expect(await names(caller.employees.list({ search: 'c.w' }))).toEqual(['Chen Wei']);
    expect(await names(caller.employees.list({ search: '%' }))).toEqual([]);
    expect(await names(caller.employees.list({ search: '_' }))).toEqual([]);
  });

  it('filters by country, role and department, combined with each other and with search', async () => {
    const { caller, dataSource } = await makeCaller();
    await given(dataSource, [
      employee({ fullName: 'Asha Rao', countryIsoCode: 'IN', roleName: 'Software Engineer' }),
      employee({ fullName: 'Arjun Mehta', countryIsoCode: 'IN', roleName: 'Recruiter' }),
      employee({ fullName: 'Ben Carter', countryIsoCode: 'US', roleName: 'Software Engineer' }),
      employee({ fullName: 'Bea Lopez', countryIsoCode: 'US', roleName: 'QA Engineer' }),
    ]);
    const { countries, roles, departments } = await caller.lookups.all();
    const india = countries.find((c) => c.isoCode === 'IN')!.id;
    const engineer = roles.find((r) => r.name === 'Software Engineer')!.id;
    const engineering = departments.find((d) => d.name === 'Engineering')!.id;

    expect(await names(caller.employees.list({ countryId: india }))).toEqual(['Arjun Mehta', 'Asha Rao']);
    expect(await names(caller.employees.list({ roleId: engineer }))).toEqual(['Asha Rao', 'Ben Carter']);
    expect(await names(caller.employees.list({ departmentId: engineering }))).toEqual(['Asha Rao', 'Bea Lopez', 'Ben Carter']);
    expect(await names(caller.employees.list({ countryId: india, departmentId: engineering }))).toEqual(['Asha Rao']);
    expect(await names(caller.employees.list({ departmentId: engineering, search: 'be' }))).toEqual(['Bea Lopez', 'Ben Carter']);
  });
});
