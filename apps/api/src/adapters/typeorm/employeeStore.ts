import type { DataSource } from 'typeorm';
import type { EmployeeStore, EmployeeView } from '../../logic/ports';
import { currentAssignments } from './currentAssignments';

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

export function createEmployeeStore(dataSource: DataSource): EmployeeStore {
  return {
    async list({ page, pageSize }) {
      const query = currentAssignments(dataSource);
      const rows = await selectEmployeeView(query.clone())
        .orderBy('e.fullName', 'ASC')
        .addOrderBy('e.id', 'ASC')
        .offset((page - 1) * pageSize)
        .limit(pageSize)
        .getRawMany<EmployeeRow>();
      // Number(): Postgres returns COUNT as a string.
      const total = Number(await query.getCount());
      return { rows: rows.map(toEmployeeView), total };
    },
  };
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
