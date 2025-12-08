import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum SprintStatus {
  PLANNED = 'PLANNED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('sprints')
@Index(['projectId', 'status'])
export class Sprint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'uuid' })
  @Index()
  projectId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  projectName: string;

  @Column({
    type: 'enum',
    enum: SprintStatus,
    default: SprintStatus.PLANNED,
  })
  status: SprintStatus;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ type: 'int', nullable: true })
  durationDays: number;

  @Column({ type: 'int', default: 0 })
  totalCapacity: number;

  @Column({ type: 'int', default: 0 })
  allocatedCapacity: number;

  @Column({ type: 'int', default: 0 })
  remainingCapacity: number;

  @Column({ type: 'int', default: 0 })
  teamSize: number;

  @Column({ type: 'jsonb', nullable: true })
  teamMembers: {
    userId: string;
    userName: string;
    capacity: number;
    allocation: number;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  goals: {
    id: string;
    description: string;
    completed: boolean;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  metrics: {
    velocity: number;
    completedStoryPoints: number;
    plannedStoryPoints: number;
    burndownRate: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;
}
