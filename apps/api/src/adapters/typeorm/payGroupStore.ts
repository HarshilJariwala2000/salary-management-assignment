import type { DataSource } from 'typeorm';
import type { Earner, PayGroupStore } from '../../logic/ports';
import { currentAssignments } from './currentAssignments';

export function createPayGroupStore(dataSource: DataSource): PayGroupStore {
  return {
    async salariesByRole(countryId) {
      const rows = await currentAssignments(dataSource)
        .select('a.roleId', 'roleId')
        .addSelect('a.annualCtc', 'annualCtc')
        .where('a.countryId = :countryId', { countryId })
        // Served by ix_assignment_pay_group in index order.
        .orderBy('a.roleId', 'ASC')
        .addOrderBy('a.annualCtc', 'ASC')
        .addOrderBy('e.id', 'ASC')
        .getRawMany<{ roleId: number; annualCtc: number }>();
      return rows.map((r) => ({ roleId: Number(r.roleId), annualCtc: Number(r.annualCtc) }));
    },

    async groupSalaries(countryId, roleId) {
      const rows = await currentAssignments(dataSource)
        .select('a.annualCtc', 'annualCtc')
        .where('a.countryId = :countryId AND a.roleId = :roleId', { countryId, roleId })
        .orderBy('a.annualCtc', 'ASC')
        .addOrderBy('e.id', 'ASC')
        .getRawMany<{ annualCtc: number }>();
      return rows.map((r) => Number(r.annualCtc));
    },

    async earners(countryId, roleId, k) {
      const end = (direction: 'ASC' | 'DESC') =>
        currentAssignments(dataSource)
          .select('e.id', 'id')
          .addSelect('e.fullName', 'fullName')
          .addSelect('a.annualCtc', 'annualCtc')
          .addSelect('e.joiningDate', 'joiningDate')
          .where('a.countryId = :countryId AND a.roleId = :roleId', { countryId, roleId })
          .orderBy('a.annualCtc', direction)
          // Ties by id ascending at both ends: never simply reverse the bottom list.
          .addOrderBy('e.id', 'ASC')
          .limit(k)
          .getRawMany<Earner>();
      const [bottom, top] = await Promise.all([end('ASC'), end('DESC')]);
      const toEarner = (e: Earner): Earner => ({ ...e, id: Number(e.id), annualCtc: Number(e.annualCtc) });
      return { bottom: bottom.map(toEarner), top: top.map(toEarner) };
    },
  };
}
