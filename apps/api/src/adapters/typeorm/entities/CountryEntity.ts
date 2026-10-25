import { Check, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('country')
@Check('ck_country_iso_code', 'length(iso_code) = 2')
@Check('ck_country_currency_code', 'length(currency_code) = 3')
export class CountryEntity {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id!: number;

  @Column({ type: 'text', unique: true })
  name!: string;

  @Column({ name: 'iso_code', type: 'text', unique: true })
  isoCode!: string;

  @Column({ name: 'currency_code', type: 'text' })
  currencyCode!: string;
}
