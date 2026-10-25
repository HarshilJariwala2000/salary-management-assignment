import { Check, Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('employee')
@Unique('uq_employee_email', ['email'])
@Check('ck_employee_email', 'email = lower(email)')
@Check('ck_employee_joining_date', 'date(joining_date) IS joining_date')
export class EmployeeEntity {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id!: number;

  @Column({ name: 'full_name', type: 'text' })
  fullName!: string;

  @Column({ type: 'text' })
  email!: string;

  @Column({ name: 'joining_date', type: 'text' })
  joiningDate!: string;
}
