import { Check, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('employee')
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
