import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('department')
export class DepartmentEntity {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id!: number;

  @Column({ type: 'text', unique: true })
  name!: string;
}
