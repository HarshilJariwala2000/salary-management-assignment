import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '@salary/api';

type Outputs = inferRouterOutputs<AppRouter>;

export const lookups: Outputs['lookups']['all'] = {
  countries: [
    { id: 1, name: 'India', isoCode: 'IN', currencyCode: 'INR' },
    { id: 2, name: 'United States', isoCode: 'US', currencyCode: 'USD' },
    { id: 3, name: 'Germany', isoCode: 'DE', currencyCode: 'EUR' },
  ],
  departments: [
    { id: 1, name: 'Engineering' },
    { id: 5, name: 'People' },
  ],
  roles: [
    { id: 1, name: 'Software Engineer', department: { id: 1, name: 'Engineering' } },
    { id: 15, name: 'Recruiter', department: { id: 5, name: 'People' } },
  ],
};

type EmployeePage = Outputs['employees']['list'];
type EmployeeRow = EmployeePage['rows'][number];

const india = { id: 1, name: 'India', isoCode: 'IN', currencyCode: 'INR' };
const unitedStates = { id: 2, name: 'United States', isoCode: 'US', currencyCode: 'USD' };

export function employeeRow(overrides: Partial<EmployeeRow> = {}): EmployeeRow {
  return {
    id: 1,
    fullName: 'Asha Rao',
    email: 'asha.rao@acme.test',
    joiningDate: '2023-04-01',
    annualCtc: 1_200_000,
    country: india,
    role: { id: 15, name: 'Recruiter' },
    department: { id: 5, name: 'People' },
    ...overrides,
  };
}

export const twoEmployees: EmployeePage = {
  total: 2,
  rows: [
    employeeRow(),
    employeeRow({
      id: 2,
      fullName: 'Ben Carter',
      email: 'ben.carter@acme.test',
      joiningDate: '2021-11-20',
      annualCtc: 95_000,
      country: unitedStates,
      role: { id: 1, name: 'Software Engineer' },
      department: { id: 1, name: 'Engineering' },
    }),
  ],
};
