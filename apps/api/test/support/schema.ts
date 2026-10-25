import { openDatabase } from '../../src/adapters/typeorm/database';

/**
 * A migrated in-memory database plus raw-SQL helpers. The schema's CHECKs,
 * unique and foreign keys are an agreed test seam (D-013): these rules are
 * enforced by the database itself, so they are tested at the database.
 */
export async function migratedDatabase() {
  const db = await openDatabase({ database: ':memory:' });
  const [india] = await db.query(`SELECT id FROM country WHERE iso_code = 'IN'`);
  const [engineer] = await db.query(`SELECT id FROM role WHERE name = 'Software Engineer'`);

  async function insertEmployee(fields: { fullName?: string; email?: string; joiningDate?: string } = {}) {
    const { fullName = 'Asha Rao', email = 'asha.rao@acme.test', joiningDate = '2024-01-15' } = fields;
    const [row] = await db.query(
      `INSERT INTO employee (full_name, email, joining_date) VALUES (?, ?, ?) RETURNING id`,
      [fullName, email, joiningDate],
    );
    return row.id as number;
  }

  async function insertAssignment(
    employeeId: number,
    fields: { countryId?: number; roleId?: number; annualCtc?: number; effectiveFrom?: string; effectiveTo?: string | null } = {},
  ) {
    const {
      countryId = india.id,
      roleId = engineer.id,
      annualCtc = 1_500_000,
      effectiveFrom = '2024-01-15',
      effectiveTo = null,
    } = fields;
    await db.query(
      `INSERT INTO assignment (employee_id, country_id, role_id, annual_ctc, effective_from, effective_to)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [employeeId, countryId, roleId, annualCtc, effectiveFrom, effectiveTo],
    );
  }

  return { db, insertEmployee, insertAssignment };
}
