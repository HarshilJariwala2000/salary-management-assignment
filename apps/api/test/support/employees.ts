import type { DataSource } from 'typeorm';
import type { makeCaller } from './app';
import { writeEmployees } from '../../src/adapters/typeorm/employeeWriter';
import type { SeedEmployee } from '../../src/seed/generateSeed';

/** A hand-built employee with sensible defaults; override only what the test cares about. */
export function employee(overrides: Partial<SeedEmployee> = {}): SeedEmployee {
  const fullName = overrides.fullName ?? 'Asha Rao';
  return {
    fullName,
    email: `${fullName.toLowerCase().replace(/[^a-z0-9]+/g, '.')}@acme.test`,
    joiningDate: '2024-01-15',
    countryIsoCode: 'IN',
    roleName: 'Software Engineer',
    annualCtc: 1_500_000,
    ...overrides,
  };
}

/** Arranges employees (each with a current assignment) through the adapter's writer. */
export function given(dataSource: DataSource, employees: SeedEmployee[]): Promise<void> {
  return writeEmployees(dataSource, employees);
}

/** n employees named "Employee 01".."Employee nn", so name order is predictable. */
export function numberedEmployees(n: number): SeedEmployee[] {
  return Array.from({ length: n }, (_, i) => employee({ fullName: `Employee ${String(i + 1).padStart(2, '0')}` }));
}

type Caller = Awaited<ReturnType<typeof makeCaller>>['caller'];

/** A valid create input for an Indian recruiter; override only what the test cares about. */
export async function newEmployee(caller: Caller, overrides: Record<string, unknown> = {}) {
  const { countries, roles } = await caller.lookups.all();
  return {
    fullName: 'Asha Rao',
    email: 'asha.rao@acme.test',
    countryId: countries.find((c) => c.isoCode === 'IN')!.id,
    roleId: roles.find((r) => r.name === 'Recruiter')!.id,
    joiningDate: '2024-01-15',
    annualCtc: 1_200_000,
    ...overrides,
  };
}
