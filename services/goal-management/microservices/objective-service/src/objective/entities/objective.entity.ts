import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { KeyResult } from './key-result.entity';

export enum ObjectiveStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

@Entity('gm_objectives')
export class Objective {
  @PrimaryGeneratedColumn('uuid')
  objectiveId: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'uuid' })
  ownerId: string;

  @Column({ length: 50 })
  timeFrame: string;

  @Column({ type: 'enum', enum: ObjectiveStatus, default: ObjectiveStatus.DRAFT })
  status: ObjectiveStatus;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  progress: number;

  @Column({ type: 'uuid', nullable: true })
  parentObjectiveId: string;

  @OneToMany(() => KeyResult, (keyResult) => keyResult.objective, { cascade: true })
  keyResults: KeyResult[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
