import { analysePayGroup, summariseByRole, type HistogramBucket, type PaySummary } from '../domain/payStats';
import { NotFound } from './errors';
import type { Country, Department, LookupStore, PayGroupStore } from './ports';

export interface RoleOverview {
  role: { id: number; name: string };
  department: Department;
  summary: PaySummary;
}

export interface RoleDetail {
  country: Country;
  role: { id: number; name: string };
  department: Department;
  summary: PaySummary;
  histogram: HistogramBucket[];
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

    /** One pay group's unrounded summary and histogram. */
    async roleDetail(countryId: number, roleId: number): Promise<RoleDetail> {
      const { countries, roles } = await lookups.all();
      const country = countries.find((c) => c.id === countryId);
      const role = roles.find((r) => r.id === roleId);
      const salaries = country && role ? await payGroups.groupSalaries(countryId, roleId) : [];
      if (!country || !role || salaries.length === 0) throw new NotFound('payGroup');

      return {
        country,
        role: { id: role.id, name: role.name },
        department: role.department,
        ...analysePayGroup(salaries),
      };
    },
  };
}

export type InsightsService = ReturnType<typeof createInsightsService>;
