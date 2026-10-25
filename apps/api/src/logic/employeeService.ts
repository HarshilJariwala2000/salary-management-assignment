import type { EmployeeDraft, EmployeeListQuery } from '@salary/shared';
import { InvalidField } from './errors';
import type { Clock, EmployeeStore, EmployeeView, Page } from './ports';

export function createEmployeeService({ employees, clock }: { employees: EmployeeStore; clock: Clock }) {
  return {
    list(query: EmployeeListQuery): Promise<Page<EmployeeView>> {
      return employees.list(query);
    },

    async create(draft: EmployeeDraft): Promise<EmployeeView> {
      // ISO dates compare correctly as strings.
      if (draft.joiningDate > clock.today()) {
        throw new InvalidField('joiningDate', 'future', 'Joining date cannot be in the future');
      }
      return employees.create(draft);
    },
  };
}

export type EmployeeService = ReturnType<typeof createEmployeeService>;
