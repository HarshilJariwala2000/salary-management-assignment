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
  /** Permanent; the employee's assignments go with them. False when the employee doesn't exist. */
  delete(id: number): Promise<boolean>;
}

export interface Earner {
  id: number;
  fullName: string;
  annualCtc: number;
  joiningDate: string;
}

export interface PayGroupStore {
  /** A country's current (role, annual CTC) pairs, sorted in SQL by role, then salary, then employee id. */
  salariesByRole(countryId: number): Promise<{ roleId: number; annualCtc: number }[]>;
  /** One pay group's current salaries, sorted in SQL by salary, then employee id. */
  groupSalaries(countryId: number, roleId: number): Promise<number[]>;
  /**
   * The k lowest and k highest paid in one pay group, selected in SQL (D-011).
   * Bottom: salary ascending; top: salary descending; ties by employee id ascending at both ends.
   */
  earners(countryId: number, roleId: number, k: number): Promise<{ bottom: Earner[]; top: Earner[] }>;
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
