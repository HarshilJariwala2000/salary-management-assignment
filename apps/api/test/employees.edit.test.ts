import { describe, expect, it } from 'vitest';
import { makeCaller } from './support/app';
import { newEmployee } from './support/employees';

describe('employees.get', () => {
  it('returns one employee by id, with their country, role and department', async () => {
    const { caller } = await makeCaller();
    const created = await caller.employees.create(await newEmployee(caller));

    expect(await caller.employees.get({ id: created.id })).toEqual(created);
  });
});
