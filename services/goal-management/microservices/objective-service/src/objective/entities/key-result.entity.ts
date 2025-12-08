import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Objective } from './objective.entity';

@Entity('gm_key_results')
export class KeyResult {
  @PrimaryGeneratedColumn('uuid')
  keyResultId: string;

  @Column({ type: 'uuid' })
  objectiveId: string;

  @Column({ length: 255 })
  metric: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  targetValue: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  currentValue: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  startValue: number;

  @Column({ length: 50, nullable: true })
  unit: string;

  @ManyToOne(() => Objective, (objective) => objective.keyResults)
  @JoinColumn({ name: 'objectiveId' })
  objective: Objective;

  @CreateDateColumn()
  createdAt: Date;
}
