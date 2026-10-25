export interface Country {
  id: number;
  name: string;
  isoCode: string;
  currencyCode: string;
}

export interface Lookups {
  countries: Country[];
}

export interface LookupStore {
  all(): Promise<Lookups>;
}

export interface Clock {
  /** Today's date as 'YYYY-MM-DD'. */
  today(): string;
}
