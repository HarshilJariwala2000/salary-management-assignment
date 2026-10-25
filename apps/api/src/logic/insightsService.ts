import { summariseByRole, type PaySummary } from '../domain/payStats';
import { NotFound } from './errors';
import type { Country, Department, LookupStore, PayGroupStore } from './ports';

export interface RoleOverview {
  role: { id: number; name: string };
  department: Department;
  summary: PaySummary;
}

export function createInsightsService({ payGroups, lookups }: { payGroups: PayGroupStore; lookups: LookupStore }) {
  return {
    /** One unrounded summary per role with employees in the country, ordered by role name. */
    async countryOverview(countryId: number): Promise<{ country: Country; roles: RoleOverview[] }> {
      const { countries, roles } = await lookups.all();
      const country = countries.find((c) => c.id === countryId);
      if (!country) throw new NotFound('country');

      const roleById = new Map(roles.map((r) => [r.id, r]));
      const overview = summariseByRole(await payGroups.salariesByRole(countryId)).map(({ roleId, summary }) => {
        const role = roleById.get(roleId)!;
        return { role: { id: role.id, name: role.name }, department: role.department, summary };
      });
      return { country, roles: overview.sort((a, b) => a.role.name.localeCompare(b.role.name)) };
    },
  };
}

export type InsightsService = ReturnType<typeof createInsightsService>;
