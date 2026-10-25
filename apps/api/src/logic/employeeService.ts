import type { EmployeeDraft, EmployeeListQuery } from '@salary/shared';
import { InvalidField } from './errors';
import type { Clock, EmployeeStore, EmployeeView, LookupStore, Page } from './ports';

export function createEmployeeService({
  employees,
  lookups,
  clock,
}: {
  employees: EmployeeStore;
  lookups: LookupStore;
  clock: Clock;
}) {
  return {
    list(query: EmployeeListQuery): Promise<Page<EmployeeView>> {
      return employees.list(query);
    },

    async get(id: number): Promise<EmployeeView> {
      return (await employees.get(id))!;
    },

    async create(draft: EmployeeDraft): Promise<EmployeeView> {
      // ISO dates compare correctly as strings.
      if (draft.joiningDate > clock.today()) {
        throw new InvalidField('joiningDate', 'future', 'Joining date cannot be in the future');
      }
      // Checked up front: SQLite's foreign-key error doesn't say which column failed.
      if (!(await lookups.countryExists(draft.countryId))) {
        throw new InvalidField('countryId', 'unknown', 'Unknown country');
      }
      if (!(await lookups.roleExists(draft.roleId))) {
        throw new InvalidField('roleId', 'unknown', 'Unknown role');
      }
      return employees.create(draft);
    },
  };
}

export type EmployeeService = ReturnType<typeof createEmployeeService>;
