import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DepartmentEntity } from './DepartmentEntity';

@Entity('role')
export class RoleEntity {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id!: number;

  @Column({ type: 'text', unique: true })
  name!: string;

  @Column({ name: 'department_id', type: 'integer' })
  departmentId!: number;

  @ManyToOne(() => DepartmentEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'department_id' })
  department!: DepartmentEntity;
}
