import type { EmployeeListQuery } from '@salary/shared';
import type { EmployeeStore, EmployeeView, Page } from './ports';

export function createEmployeeService({ employees }: { employees: EmployeeStore }) {
  return {
    list(query: EmployeeListQuery): Promise<Page<EmployeeView>> {
      return employees.list(query);
    },
  };
}

export type EmployeeService = ReturnType<typeof createEmployeeService>;
