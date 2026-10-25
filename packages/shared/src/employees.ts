import { z } from 'zod';

export const PAGE_SIZES = [10, 20, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 20;

export const employeeListInput = z.object({
  /** Matches any part of the name or email, ignoring case. */
  search: z.string().trim().max(100).optional(),
  countryId: z.number().int().positive().optional(),
  roleId: z.number().int().positive().optional(),
  departmentId: z.number().int().positive().optional(),
  sortBy: z.enum(['name', 'joiningDate', 'annualCtc']).default('name'),
  sortDirection: z.enum(['asc', 'desc']).default('asc'),
  page: z.number().int().min(1).default(1),
  pageSize: z.union([z.literal(10), z.literal(20), z.literal(50), z.literal(100)]).default(DEFAULT_PAGE_SIZE),
})
  // Salaries are only comparable within one currency (D-004).
  .refine((q) => q.sortBy !== 'annualCtc' || q.countryId !== undefined, {
    path: ['sortBy'],
    message: 'Choose a country to sort by salary',
  });

/** What HR enters for an employee. Shared by the API and the form, so both apply the same rules. */
export const employeeInput = z.object({
  fullName: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().toLowerCase().pipe(z.email('Enter a valid email')),
  countryId: z.number().int().positive('Choose a country'),
  roleId: z.number().int().positive('Choose a role'),
  joiningDate: z.iso.date('Enter a valid date'),
  annualCtc: z.number({ error: 'Enter the annual CTC' }).int('Annual CTC must be a whole number').positive('Annual CTC must be more than 0'),
});

export type EmployeeInput = z.input<typeof employeeInput>;
export type EmployeeDraft = z.output<typeof employeeInput>;

export const employeeIdInput = z.object({ id: z.number().int().positive() });

export const employeeUpdateInput = employeeInput.extend(employeeIdInput.shape);

export type EmployeeListInput = z.input<typeof employeeListInput>;
export type EmployeeListQuery = z.output<typeof employeeListInput>;
