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

  it.each(['2023-02-30', '15/01/2024', '2024-1-5'])('rejects a joining date of %s (must be a real ISO date)', async (joiningDate) => {
    const { insertEmployee } = await migratedDatabase();

    await expect(insertEmployee({ joiningDate })).rejects.toThrow(/CHECK constraint failed/);
  });

  it('rejects an assignment with an invalid date or one that ends before it starts', async () => {
    const { insertEmployee, insertAssignment } = await migratedDatabase();
    const employeeId = await insertEmployee();

    await expect(insertAssignment(employeeId, { effectiveFrom: '2024-02-30' })).rejects.toThrow(/CHECK constraint failed/);
    await expect(
      insertAssignment(employeeId, { effectiveFrom: '2024-03-01', effectiveTo: '2024-02-01' }),
    ).rejects.toThrow(/CHECK constraint failed/);
  });
});
