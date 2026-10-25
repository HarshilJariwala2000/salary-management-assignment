import type { EmployeeDraft, EmployeeListQuery } from '@salary/shared';
import type { EmployeeStore, EmployeeView, Page } from './ports';

export function createEmployeeService({ employees }: { employees: EmployeeStore }) {
  return {
    list(query: EmployeeListQuery): Promise<Page<EmployeeView>> {
      return employees.list(query);
    },

    create(draft: EmployeeDraft): Promise<EmployeeView> {
      return employees.create(draft);
    },
  };
}

export type EmployeeService = ReturnType<typeof createEmployeeService>;
