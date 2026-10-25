import type { DataSource, EntityManager, SelectQueryBuilder } from 'typeorm';
import { AssignmentEntity } from './entities/AssignmentEntity';
import { CountryEntity } from './entities/CountryEntity';
import { DepartmentEntity } from './entities/DepartmentEntity';
import { EmployeeEntity } from './entities/EmployeeEntity';
import { RoleEntity } from './entities/RoleEntity';

/**
 * The only way to read current employee data: employees joined to their current
 * assignment (effective_to IS NULL), its country, role and department. Every read
 * goes through here, which also lets SQLite use the partial indexes (D-010).
 * Aliases: e employee, a assignment, c country, r role, d department.
 */
export function currentAssignments(db: DataSource | EntityManager): SelectQueryBuilder<EmployeeEntity> {
  return db
    .createQueryBuilder(EmployeeEntity, 'e')
    .innerJoin(AssignmentEntity, 'a', 'a.employeeId = e.id AND a.effectiveTo IS NULL')
    .innerJoin(CountryEntity, 'c', 'c.id = a.countryId')
    .innerJoin(RoleEntity, 'r', 'r.id = a.roleId')
    .innerJoin(DepartmentEntity, 'd', 'd.id = r.departmentId');
}
