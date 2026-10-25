import type { DataSource } from 'typeorm';
import type { LookupStore } from '../../logic/ports';
import { CountryEntity } from './entities/CountryEntity';
import { DepartmentEntity } from './entities/DepartmentEntity';
import { RoleEntity } from './entities/RoleEntity';

export function createLookupStore(dataSource: DataSource): LookupStore {
  return {
    async all() {
      const [countries, departments, roles] = await Promise.all([
        dataSource.getRepository(CountryEntity).find({ order: { name: 'ASC' } }),
        dataSource.getRepository(DepartmentEntity).find({ order: { name: 'ASC' } }),
        dataSource.getRepository(RoleEntity).find({ relations: { department: true }, order: { name: 'ASC' } }),
      ]);
      return {
        countries: countries.map(({ id, name, isoCode, currencyCode }) => ({ id, name, isoCode, currencyCode })),
        departments: departments.map(({ id, name }) => ({ id, name })),
        roles: roles.map(({ id, name, department }) => ({ id, name, department: { id: department.id, name: department.name } })),
      };
    },

    countryExists(id) {
      return dataSource.getRepository(CountryEntity).existsBy({ id });
    },

    roleExists(id) {
      return dataSource.getRepository(RoleEntity).existsBy({ id });
    },
  };
}
