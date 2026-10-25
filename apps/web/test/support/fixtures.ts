import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '@salary/api';

type Outputs = inferRouterOutputs<AppRouter>;

export const lookups: Outputs['lookups']['all'] = {
  countries: [
    { id: 1, name: 'India', isoCode: 'IN', currencyCode: 'INR' },
    { id: 2, name: 'Germany', isoCode: 'DE', currencyCode: 'EUR' },
  ],
  departments: [{ id: 1, name: 'Engineering' }],
  roles: [{ id: 1, name: 'Software Engineer', department: { id: 1, name: 'Engineering' } }],
};
