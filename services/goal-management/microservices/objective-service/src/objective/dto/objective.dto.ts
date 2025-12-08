import { IsString, IsUUID, IsOptional, IsEnum, IsNumber, Min, Max, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ObjectiveStatus } from '../entities/objective.entity';

export class CreateKeyResultDto {
  @ApiProperty()
  @IsString()
  metric: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  targetValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  startValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  unit?: string;
}

export class CreateObjectiveDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsUUID()
  ownerId: string;

  @ApiProperty({ description: 'e.g., Q1 2024, FY2024' })
  @IsString()
  timeFrame: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  parentObjectiveId?: string;

  @ApiPropertyOptional({ type: [CreateKeyResultDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateKeyResultDto)
  keyResults?: CreateKeyResultDto[];
}

export class UpdateObjectiveDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(ObjectiveStatus)
  status?: ObjectiveStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress?: number;
}

export class ObjectiveResponseDto {
  @ApiProperty()
  objectiveId: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  ownerId: string;

  @ApiProperty()
  timeFrame: string;

  @ApiProperty()
  status: ObjectiveStatus;

  @ApiProperty()
  progress: number;

  @ApiPropertyOptional()
  parentObjectiveId?: string;

  @ApiProperty()
  keyResults: KeyResultResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class KeyResultResponseDto {
  @ApiProperty()
  keyResultId: string;

  @ApiProperty()
  objectiveId: string;

  @ApiProperty()
  metric: string;

  @ApiPropertyOptional()
  targetValue?: number;

  @ApiPropertyOptional()
  currentValue?: number;

  @ApiPropertyOptional()
  startValue?: number;

  @ApiPropertyOptional()
  unit?: string;

  @ApiProperty()
  createdAt: Date;
}
