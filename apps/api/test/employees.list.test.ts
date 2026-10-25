import { describe, expect, it } from 'vitest';
import { makeCaller } from './support/app';
import { given, numberedEmployees } from './support/employees';

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
});
