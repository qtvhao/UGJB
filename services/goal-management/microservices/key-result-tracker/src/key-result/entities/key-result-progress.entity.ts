import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ProgressStatus {
  ON_TRACK = 'on_track',
  AT_RISK = 'at_risk',
  OFF_TRACK = 'off_track',
  COMPLETED = 'completed',
}

export enum MetricType {
  PERCENTAGE = 'percentage',
  ABSOLUTE = 'absolute',
  BOOLEAN = 'boolean',
  CURRENCY = 'currency',
}

@Entity('key_result_progress')
@Index(['keyResultId', 'recordedAt'])
@Index(['keyResultId', 'status'])
export class KeyResultProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'key_result_id' })
  @Index()
  keyResultId: string;

  @Column({ type: 'uuid', name: 'objective_id' })
  @Index()
  objectiveId: string;

  @Column({ type: 'varchar', length: 255, name: 'key_result_name' })
  keyResultName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Metric configuration
  @Column({
    type: 'enum',
    enum: MetricType,
    default: MetricType.PERCENTAGE,
    name: 'metric_type',
  })
  metricType: MetricType;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'target_value' })
  targetValue: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'starting_value', default: 0 })
  startingValue: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'current_value' })
  currentValue: number;

  // Progress calculation
  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'progress_percentage', default: 0 })
  progressPercentage: number;

  @Column({
    type: 'enum',
    enum: ProgressStatus,
    default: ProgressStatus.ON_TRACK,
  })
  status: ProgressStatus;

  // Tracking metadata
  @Column({ type: 'uuid', name: 'updated_by', nullable: true })
  updatedBy: string;

  @Column({ type: 'varchar', length: 255, name: 'update_source', nullable: true })
  updateSource: string; // 'manual', 'webhook', 'integration', 'automated'

  @Column({ type: 'jsonb', nullable: true, name: 'metric_metadata' })
  metricMetadata: Record<string, any>; // Additional metric-specific data

  @Column({ type: 'text', nullable: true, comment: 'comment' })
  comment: string;

  @Column({ type: 'timestamp', name: 'recorded_at' })
  recordedAt: Date;

  @Column({ type: 'date', name: 'due_date', nullable: true })
  dueDate: Date;

  // Confidence scoring
  @Column({ type: 'integer', name: 'confidence_score', nullable: true })
  confidenceScore: number; // 0-100 scale

  // Version tracking
  @Column({ type: 'integer', default: 1 })
  version: number;

  @Column({ type: 'boolean', name: 'is_latest', default: true })
  @Index()
  isLatest: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date;

  // Calculated fields (not persisted)
  get remainingValue(): number {
    return Number(this.targetValue) - Number(this.currentValue);
  }

  get isOverdue(): boolean {
    if (!this.dueDate) return false;
    return new Date() > new Date(this.dueDate) && this.status !== ProgressStatus.COMPLETED;
  }

  get daysUntilDue(): number | null {
    if (!this.dueDate) return null;
    const today = new Date();
    const due = new Date(this.dueDate);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
