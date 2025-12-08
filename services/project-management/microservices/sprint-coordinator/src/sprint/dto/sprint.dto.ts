import {
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsInt,
  IsDate,
  IsArray,
  ValidateNested,
  IsObject,
  IsBoolean,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SprintStatus } from '../entities/sprint.entity';

export class TeamMemberDto {
  @IsUUID()
  userId: string;

  @IsString()
  userName: string;

  @IsInt()
  @Min(0)
  capacity: number;

  @IsInt()
  @Min(0)
  allocation: number;
}

export class SprintGoalDto {
  @IsString()
  id: string;

  @IsString()
  description: string;

  @IsBoolean()
  completed: boolean;
}

export class SprintMetricsDto {
  @IsInt()
  @Min(0)
  velocity: number;

  @IsInt()
  @Min(0)
  completedStoryPoints: number;

  @IsInt()
  @Min(0)
  plannedStoryPoints: number;

  @IsInt()
  @Min(0)
  burndownRate: number;
}

export class CreateSprintDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUUID()
  projectId: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  projectName?: string;

  @IsOptional()
  @IsEnum(SprintStatus)
  status?: SprintStatus;

  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @IsOptional()
  @IsInt()
  @Min(1)
  durationDays?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  totalCapacity?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  allocatedCapacity?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  remainingCapacity?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  teamSize?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TeamMemberDto)
  teamMembers?: TeamMemberDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SprintGoalDto)
  goals?: SprintGoalDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => SprintMetricsDto)
  metrics?: SprintMetricsDto;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateSprintDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  projectName?: string;

  @IsOptional()
  @IsEnum(SprintStatus)
  status?: SprintStatus;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @IsOptional()
  @IsInt()
  @Min(1)
  durationDays?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  totalCapacity?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  allocatedCapacity?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  remainingCapacity?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  teamSize?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TeamMemberDto)
  teamMembers?: TeamMemberDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SprintGoalDto)
  goals?: SprintGoalDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => SprintMetricsDto)
  metrics?: SprintMetricsDto;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class SprintQueryDto {
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsOptional()
  @IsEnum(SprintStatus)
  status?: SprintStatus;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number;
}
