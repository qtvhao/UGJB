import {
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsArray,
  IsInt,
  Min,
  IsDateString,
  IsEmail,
  IsBoolean,
  IsObject,
  MaxLength,
} from 'class-validator';
import { TaskStatus, TaskPriority } from '../entities/task.entity';

export class CreateTaskDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsUUID()
  projectId: string;

  @IsOptional()
  @IsString()
  sprintId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skillsRequired?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  estimatedHours?: number;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  createdBy?: string;
}

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsString()
  sprintId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skillsRequired?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  estimatedHours?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  actualHours?: number;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  updatedBy?: string;
}

export class AssignTaskDto {
  @IsUUID()
  assigneeId: string;

  @IsString()
  assigneeName: string;

  @IsOptional()
  @IsEmail()
  assigneeEmail?: string;

  @IsOptional()
  @IsString()
  updatedBy?: string;
}

export class TaskFilterDto {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsUUID()
  assigneeId?: string;

  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsOptional()
  @IsString()
  sprintId?: string;

  @IsOptional()
  @IsBoolean()
  unassignedOnly?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}

export class AutoAssignTaskDto {
  @IsUUID()
  taskId: string;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  candidateAssigneeIds?: string[];

  @IsOptional()
  @IsString()
  updatedBy?: string;
}

export class BulkAssignTasksDto {
  @IsArray()
  @IsUUID(undefined, { each: true })
  taskIds: string[];

  @IsUUID()
  assigneeId: string;

  @IsString()
  assigneeName: string;

  @IsOptional()
  @IsEmail()
  assigneeEmail?: string;

  @IsOptional()
  @IsString()
  updatedBy?: string;
}

export class TaskResponseDto {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string;
  assigneeName: string;
  assigneeEmail: string;
  projectId: string;
  sprintId: string;
  skillsRequired: string[];
  estimatedHours: number;
  actualHours: number;
  dueDate: Date;
  startedAt: Date;
  completedAt: Date;
  metadata: Record<string, any>;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class PaginatedTaskResponseDto {
  data: TaskResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
