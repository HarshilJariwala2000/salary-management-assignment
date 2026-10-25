import type { DataSource } from 'typeorm';
import type { PayGroupStore } from '../../logic/ports';
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
  };
}
