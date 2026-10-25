import type { DataSource, EntityManager } from 'typeorm';
import type { EmployeeDraft } from '@salary/shared';
import type { EmployeeStore, EmployeeView } from '../../logic/ports';
import { currentAssignments } from './currentAssignments';
import { translateDatabaseError } from './errors';

interface EmployeeRow {
  id: number;
  fullName: string;
  email: string;
  joiningDate: string;
  annualCtc: number;
  countryId: number;
  countryName: string;
  isoCode: string;
  currencyCode: string;
  roleId: number;
  roleName: string;
  departmentId: number;
  departmentName: string;
}

const sortColumns = {
  name: 'e.fullName',
  joiningDate: 'e.joiningDate',
  annualCtc: 'a.annualCtc',
} as const;

export function createEmployeeStore(dataSource: DataSource): EmployeeStore {
  return {
    async list({ search, countryId, roleId, departmentId, sortBy, sortDirection, page, pageSize }) {
      const query = currentAssignments(dataSource);
      if (search) {
        // lower(...) LIKE works the same on SQLite and Postgres; emails are stored lower-cased.
        query.andWhere(`(lower(e.fullName) LIKE :pattern ESCAPE '\\' OR e.email LIKE :pattern ESCAPE '\\')`, {
          pattern: `%${escapeLike(search.toLowerCase())}%`,
        });
      }
      if (countryId) query.andWhere('a.countryId = :countryId', { countryId });
      if (roleId) query.andWhere('a.roleId = :roleId', { roleId });
      if (departmentId) query.andWhere('r.departmentId = :departmentId', { departmentId });
      const rows = await selectEmployeeView(query.clone())
        .orderBy(sortColumns[sortBy], sortDirection === 'asc' ? 'ASC' : 'DESC')
        // Ties always break by id, so pages and rankings never shuffle between requests.
        .addOrderBy('e.id', 'ASC')
        .offset((page - 1) * pageSize)
        .limit(pageSize)
        .getRawMany<EmployeeRow>();
      // Number(): Postgres returns COUNT as a string.
      const total = Number(await query.getCount());
      return { rows: rows.map(toEmployeeView), total };
    },

    async update(id, draft) {
      try {
        return await updateEmployee(dataSource, id, draft);
      } catch (error) {
        throw translateDatabaseError(error);
      }
    },

    async delete(id) {
      // Hard delete; ON DELETE CASCADE removes the employee's assignments.
      const deleted = await dataSource.query('DELETE FROM employee WHERE id = ? RETURNING id', [id]);
      return deleted.length > 0;
    },

    async get(id) {
      return (await findEmployee(dataSource, id)) ?? null;
    },

    async create(draft) {
      try {
        return await dataSource.transaction(async (tx) => {
          const [{ id }] = await tx.query(
            'INSERT INTO employee (full_name, email, joining_date) VALUES (?, ?, ?) RETURNING id',
            [draft.fullName, draft.email, draft.joiningDate],
          );
          await tx.query(
            `INSERT INTO assignment (employee_id, country_id, role_id, annual_ctc, effective_from)
             VALUES (?, ?, ?, ?, ?)`,
            [id, draft.countryId, draft.roleId, draft.annualCtc, draft.joiningDate],
          );
          return (await findEmployee(tx, id))!;
        });
      } catch (error) {
        throw translateDatabaseError(error);
      }
    },
  };
}

async function updateEmployee(dataSource: DataSource, id: number, draft: EmployeeDraft): Promise<EmployeeView | null> {
  return dataSource.transaction(async (tx) => {
    const updated = await tx.query('UPDATE employee SET full_name = ?, email = ?, joining_date = ? WHERE id = ? RETURNING id', [
      draft.fullName,
      draft.email,
      draft.joiningDate,
      id,
    ]);
    if (updated.length === 0) return null;
    // In place: the current assignment changes, no history row is written (D-010).
    await tx.query(
      `UPDATE assignment SET country_id = ?, role_id = ?, annual_ctc = ?, effective_from = ?
       WHERE employee_id = ? AND effective_to IS NULL`,
      [draft.countryId, draft.roleId, draft.annualCtc, draft.joiningDate, id],
    );
    return (await findEmployee(tx, id))!;
  });
}

async function findEmployee(db: DataSource | EntityManager, id: number): Promise<EmployeeView | undefined> {
  const row = await selectEmployeeView(currentAssignments(db)).where('e.id = :id', { id }).getRawOne<EmployeeRow>();
  return row && toEmployeeView(row);
}

/** Makes %, _ and the escape character match themselves in a LIKE pattern. */
function escapeLike(text: string): string {
  return text.replace(/[\\%_]/g, (c) => `\\${c}`);
}

function selectEmployeeView(query: ReturnType<typeof currentAssignments>) {
  return query
    .select('e.id', 'id')
    .addSelect('e.fullName', 'fullName')
    .addSelect('e.email', 'email')
    .addSelect('e.joiningDate', 'joiningDate')
    .addSelect('a.annualCtc', 'annualCtc')
    .addSelect('c.id', 'countryId')
    .addSelect('c.name', 'countryName')
    .addSelect('c.isoCode', 'isoCode')
    .addSelect('c.currencyCode', 'currencyCode')
    .addSelect('r.id', 'roleId')
    .addSelect('r.name', 'roleName')
    .addSelect('d.id', 'departmentId')
    .addSelect('d.name', 'departmentName');
}

function toEmployeeView(row: EmployeeRow): EmployeeView {
  return {
    id: row.id,
    fullName: row.fullName,
    email: row.email,
    joiningDate: row.joiningDate,
    annualCtc: row.annualCtc,
    country: { id: row.countryId, name: row.countryName, isoCode: row.isoCode, currencyCode: row.currencyCode },
    role: { id: row.roleId, name: row.roleName },
    department: { id: row.departmentId, name: row.departmentName },
  };
}
