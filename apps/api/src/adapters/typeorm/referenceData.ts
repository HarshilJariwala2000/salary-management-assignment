import type { DataSource } from 'typeorm';
import { CountryEntity } from './entities/CountryEntity';
import { DepartmentEntity } from './entities/DepartmentEntity';
import { RoleEntity } from './entities/RoleEntity';

const countries = [
  { name: 'India', isoCode: 'IN', currencyCode: 'INR' },
  { name: 'United States', isoCode: 'US', currencyCode: 'USD' },
  { name: 'United Kingdom', isoCode: 'GB', currencyCode: 'GBP' },
  { name: 'Germany', isoCode: 'DE', currencyCode: 'EUR' },
  { name: 'Singapore', isoCode: 'SG', currencyCode: 'SGD' },
  { name: 'Brazil', isoCode: 'BR', currencyCode: 'BRL' },
];

/** Each role belongs to exactly one department (D-009). */
const rolesByDepartment: Record<string, string[]> = {
  Engineering: ['Software Engineer', 'Senior Software Engineer', 'Engineering Manager', 'QA Engineer'],
  Product: ['Product Manager', 'Product Designer', 'Data Analyst'],
  Sales: ['Account Executive', 'Sales Manager', 'Sales Development Representative'],
  Finance: ['Financial Analyst', 'Accountant', 'Finance Manager'],
  People: ['HR Business Partner', 'Recruiter'],
};

/** Inserts the fixed lists if they are missing. Safe to run on every boot. */
export async function ensureReferenceData(dataSource: DataSource): Promise<void> {
  await dataSource.transaction(async (tx) => {
    if ((await tx.count(CountryEntity)) === 0) await tx.insert(CountryEntity, countries);

    if ((await tx.count(DepartmentEntity)) === 0) {
      for (const [departmentName, roleNames] of Object.entries(rolesByDepartment)) {
        const { identifiers } = await tx.insert(DepartmentEntity, { name: departmentName });
        const departmentId = identifiers[0]!.id as number;
        await tx.insert(RoleEntity, roleNames.map((name) => ({ name, departmentId })));
      }
    }
  });
}
