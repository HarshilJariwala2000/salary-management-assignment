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

  it.each([0, -5, 1.5])('rejects an annual CTC of %s (must be a positive integer)', async (annualCtc) => {
    const { insertEmployee, insertAssignment } = await migratedDatabase();
    const employeeId = await insertEmployee();

    await expect(insertAssignment(employeeId, { annualCtc })).rejects.toThrow(/CHECK constraint failed/);
  });
});
