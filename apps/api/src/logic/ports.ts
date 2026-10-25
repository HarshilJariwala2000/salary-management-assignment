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

export interface LookupStore {
  all(): Promise<Lookups>;
}

export interface Clock {
  /** Today's date as 'YYYY-MM-DD'. */
  today(): string;
}
