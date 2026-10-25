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

type CountryOverview = Outputs['insights']['countryOverview'];
type RoleOverview = CountryOverview['roles'][number];

function roleOverview(
  role: [number, string],
  department: [number, string],
  summary: RoleOverview['summary'],
): RoleOverview {
  return { role: { id: role[0], name: role[1] }, department: { id: department[0], name: department[1] }, summary };
}

/** Name order (Account Executive, Recruiter, Software Engineer) differs from median order, so sorting is visible. */
export const indiaOverview: CountryOverview = {
  country: india,
  roles: [
    roleOverview([8, 'Account Executive'], [3, 'Sales'], {
      headcount: 1, min: 2_500_000, max: 2_500_000, average: 2_500_000, median: 2_500_000, spreadAmount: 0, spreadRatio: 1,
    }),
    roleOverview([15, 'Recruiter'], [5, 'People'], {
      headcount: 2, min: 800_000, max: 900_000, average: 850_000, median: 850_000, spreadAmount: 100_000, spreadRatio: 1.13,
    }),
    roleOverview([1, 'Software Engineer'], [1, 'Engineering'], {
      headcount: 3, min: 1_000_000, max: 2_000_001, average: 1_500_000, median: 1_500_000, spreadAmount: 1_000_001, spreadRatio: 2,
    }),
  ],
};

/** Recruiters in India: 800,000 and 900,000, so buckets are 10,000 wide. */
export const indiaRecruiterDetail: Outputs['insights']['roleDetail'] = {
  country: india,
  role: { id: 15, name: 'Recruiter' },
  department: { id: 5, name: 'People' },
  summary: indiaOverview.roles[1]!.summary,
  histogram: Array.from({ length: 10 }, (_, i) => ({
    lower: 800_000 + i * 10_000,
    upper: 810_000 + i * 10_000,
    count: i === 0 || i === 9 ? 1 : 0,
  })),
};
