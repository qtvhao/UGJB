import {
  IsString,
  IsUUID,
  IsEnum,
  IsNumber,
  IsOptional,
  IsDateString,
  IsObject,
  IsBoolean,
  Min,
  Max,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProgressStatus, MetricType } from '../entities/key-result-progress.entity';

export class CreateKeyResultProgressDto {
  @IsUUID()
  @IsNotEmpty()
  keyResultId: string;

  @IsUUID()
  @IsNotEmpty()
  objectiveId: string;

  @IsString()
  @IsNotEmpty()
  keyResultName: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(MetricType)
  metricType: MetricType;

  @IsNumber()
  @Type(() => Number)
  targetValue: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  startingValue?: number;

  @IsNumber()
  @Type(() => Number)
  currentValue: number;

  @IsUUID()
  @IsOptional()
  updatedBy?: string;

  @IsString()
  @IsOptional()
  updateSource?: string;

  @IsObject()
  @IsOptional()
  metricMetadata?: Record<string, any>;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsDateString()
  @IsOptional()
  recordedAt?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  confidenceScore?: number;
}

export class UpdateKeyResultProgressDto {
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  currentValue?: number;

  @IsEnum(ProgressStatus)
  @IsOptional()
  status?: ProgressStatus;

  @IsUUID()
  @IsOptional()
  updatedBy?: string;

  @IsString()
  @IsOptional()
  updateSource?: string;

  @IsObject()
  @IsOptional()
  metricMetadata?: Record<string, any>;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsDateString()
  @IsOptional()
  recordedAt?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  confidenceScore?: number;
}

export class MetricUpdateWebhookDto {
  @IsUUID()
  @IsNotEmpty()
  keyResultId: string;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  metricValue: number;

  @IsString()
  @IsOptional()
  source?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsDateString()
  @IsOptional()
  timestamp?: string;

  @IsString()
  @IsOptional()
  comment?: string;
}

export class ProgressQueryDto {
  @IsUUID()
  @IsOptional()
  keyResultId?: string;

  @IsUUID()
  @IsOptional()
  objectiveId?: string;

  @IsEnum(ProgressStatus)
  @IsOptional()
  status?: ProgressStatus;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  latestOnly?: boolean;

  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  offset?: number;
}

export class KeyResultProgressResponseDto {
  id: string;
  keyResultId: string;
  objectiveId: string;
  keyResultName: string;
  description?: string;
  metricType: MetricType;
  targetValue: number;
  startingValue: number;
  currentValue: number;
  progressPercentage: number;
  status: ProgressStatus;
  updatedBy?: string;
  updateSource?: string;
  metricMetadata?: Record<string, any>;
  comment?: string;
  recordedAt: Date;
  dueDate?: Date;
  confidenceScore?: number;
  version: number;
  isLatest: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Calculated fields
  remainingValue?: number;
  isOverdue?: boolean;
  daysUntilDue?: number;
}

export class ProgressSummaryDto {
  keyResultId: string;
  objectiveId: string;
  keyResultName: string;
  currentProgress: number;
  status: ProgressStatus;
  totalUpdates: number;
  lastUpdated: Date;
  averageProgressRate?: number; // progress per day
  estimatedCompletionDate?: Date;
  daysUntilDue?: number;
  isOnTrack: boolean;
}

export class BulkMetricUpdateDto {
  @IsNotEmpty()
  updates: MetricUpdateWebhookDto[];

  @IsString()
  @IsOptional()
  batchId?: string;

  @IsDateString()
  @IsOptional()
  timestamp?: string;
}
