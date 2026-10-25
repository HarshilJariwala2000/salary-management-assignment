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
});
