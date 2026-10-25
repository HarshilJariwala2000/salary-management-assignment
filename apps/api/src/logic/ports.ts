import type { EmployeeDraft, EmployeeListQuery } from '@salary/shared';

export interface Country {
  id: number;
  name: string;
  isoCode: string;
  currencyCode: string;
}

export interface Department {
  id: number;
  name: string;
}

export interface Role {
  id: number;
  name: string;
  department: Department;
}

export interface Lookups {
  countries: Country[];
  departments: Department[];
  roles: Role[];
}

export interface EmployeeView {
  id: number;
  fullName: string;
  email: string;
  joiningDate: string;
  annualCtc: number;
  country: { id: number; name: string; isoCode: string; currencyCode: string };
  role: { id: number; name: string };
  department: { id: number; name: string };
}

export interface Page<T> {
  rows: T[];
  total: number;
}

export interface EmployeeStore {
  /** Filtering, sorting and pagination all happen in SQL; ORDER BY always ends with employee id. */
  list(query: EmployeeListQuery): Promise<Page<EmployeeView>>;
  get(id: number): Promise<EmployeeView | null>;
  /** One transaction: the employee plus a current assignment starting on the joining date. */
  create(draft: EmployeeDraft): Promise<EmployeeView>;
  /**
   * Edits the employee and their current assignment in place: no history row is written (D-010).
   * The assignment's start date follows the joining date. Null when the employee doesn't exist.
   */
  update(id: number, draft: EmployeeDraft): Promise<EmployeeView | null>;
}

export interface LookupStore {
  all(): Promise<Lookups>;
  countryExists(id: number): Promise<boolean>;
  roleExists(id: number): Promise<boolean>;
}

export interface Clock {
  /** Today's date as 'YYYY-MM-DD'. */
  today(): string;
}
