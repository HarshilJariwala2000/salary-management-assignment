import { describe, expect, it } from 'vitest';
import { migratedDatabase } from './support/schema';

describe('migrated schema', () => {
  it('accepts an employee with one current assignment', async () => {
    const { db, insertEmployee, insertAssignment } = await migratedDatabase();

    const employeeId = await insertEmployee();
    await insertAssignment(employeeId);

    const [row] = await db.query(`SELECT count(*) AS n FROM assignment WHERE effective_to IS NULL`);
    expect(row.n).toBe(1);
  });
});
