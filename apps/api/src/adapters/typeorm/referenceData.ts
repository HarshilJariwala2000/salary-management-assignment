import type { DataSource } from 'typeorm';
import { countries, departments, roles } from '../../seed/referenceData';
import { CountryEntity } from './entities/CountryEntity';
import { DepartmentEntity } from './entities/DepartmentEntity';
import { RoleEntity } from './entities/RoleEntity';

/** Inserts the fixed lists if they are missing. Safe to run on every boot. */
export async function ensureReferenceData(dataSource: DataSource): Promise<void> {
  await dataSource.transaction(async (tx) => {
    if ((await tx.count(CountryEntity)) === 0) {
      await tx.insert(
        CountryEntity,
        countries.map(({ name, isoCode, currencyCode }) => ({ name, isoCode, currencyCode })),
      );
    }

    if ((await tx.count(DepartmentEntity)) === 0) {
      for (const departmentName of departments) {
        const { identifiers } = await tx.insert(DepartmentEntity, { name: departmentName });
        const departmentId = identifiers[0]!.id as number;
        await tx.insert(
          RoleEntity,
          roles.filter((r) => r.department === departmentName).map(({ name }) => ({ name, departmentId })),
        );
      }
    }
  });
}
