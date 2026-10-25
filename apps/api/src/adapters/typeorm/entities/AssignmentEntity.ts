import { Check, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { CountryEntity } from './CountryEntity';
import { EmployeeEntity } from './EmployeeEntity';
import { RoleEntity } from './RoleEntity';

/** An employee's country, role and annual CTC from one date to another. effectiveTo null = current (D-010). */
@Entity('assignment')
@Unique('uq_assignment_employee_start', ['employeeId', 'effectiveFrom'])
@Index('ux_assignment_current', ['employeeId'], { unique: true, where: 'effective_to IS NULL' })
@Check('ck_assignment_annual_ctc', `typeof(annual_ctc) = 'integer' AND annual_ctc > 0`)
@Check('ck_assignment_effective_from', 'date(effective_from) IS effective_from')
@Check(
  'ck_assignment_effective_to',
  'effective_to IS NULL OR (date(effective_to) IS effective_to AND effective_to > effective_from)',
)
export class AssignmentEntity {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id!: number;

  @Column({ name: 'employee_id', type: 'integer' })
  employeeId!: number;

  @ManyToOne(() => EmployeeEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee!: EmployeeEntity;

  @Column({ name: 'country_id', type: 'integer' })
  countryId!: number;

  @ManyToOne(() => CountryEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'country_id' })
  country!: CountryEntity;

  @Column({ name: 'role_id', type: 'integer' })
  roleId!: number;

  @ManyToOne(() => RoleEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'role_id' })
  role!: RoleEntity;

  @Column({ name: 'annual_ctc', type: 'integer' })
  annualCtc!: number;

  @Column({ name: 'effective_from', type: 'text' })
  effectiveFrom!: string;

  @Column({ name: 'effective_to', type: 'text', nullable: true })
  effectiveTo!: string | null;
}
