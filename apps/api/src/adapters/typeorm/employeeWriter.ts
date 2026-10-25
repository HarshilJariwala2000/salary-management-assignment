import type { DataSource } from 'typeorm';
import type { SeedEmployee } from '../../seed/generateSeed';
import { CountryEntity } from './entities/CountryEntity';
import { RoleEntity } from './entities/RoleEntity';

/** Rows per multi-row INSERT; keeps each statement well under SQLite's bound-parameter limit. */
const CHUNK = 500;

/**
 * Writes employees, each with a current assignment starting on the joining date,
 * in one transaction. Used by the seed and by tests to arrange data.
 */
export async function writeEmployees(dataSource: DataSource, employees: SeedEmployee[]): Promise<void> {
  await dataSource.transaction(async (tx) => {
    const countryIds = new Map((await tx.find(CountryEntity)).map((c) => [c.isoCode, c.id]));
    const roleIds = new Map((await tx.find(RoleEntity)).map((r) => [r.name, r.id]));

    for (let start = 0; start < employees.length; start += CHUNK) {
      const chunk = employees.slice(start, start + CHUNK);
      const inserted: { id: number; email: string }[] = await tx.query(
        `INSERT INTO employee (full_name, email, joining_date) VALUES ${chunk.map(() => '(?, ?, ?)').join(', ')}
         RETURNING id, email`,
        chunk.flatMap((e) => [e.fullName, e.email, e.joiningDate]),
      );
      // RETURNING order is not guaranteed, so match rows back by their unique email.
      const idByEmail = new Map(inserted.map((row) => [row.email, row.id]));
      await tx.query(
        `INSERT INTO assignment (employee_id, country_id, role_id, annual_ctc, effective_from)
         VALUES ${chunk.map(() => '(?, ?, ?, ?, ?)').join(', ')}`,
        chunk.flatMap((e) => [
          idByEmail.get(e.email),
          required(countryIds.get(e.countryIsoCode), `country ${e.countryIsoCode}`),
          required(roleIds.get(e.roleName), `role ${e.roleName}`),
          e.annualCtc,
          e.joiningDate,
        ]),
      );
    }
  });
}

function required<T>(value: T | undefined, what: string): T {
  if (value === undefined) throw new Error(`Unknown ${what}`);
  return value;
}
