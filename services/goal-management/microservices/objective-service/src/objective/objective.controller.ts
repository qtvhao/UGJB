/**
 * Associated Frontend Files:
 *   - web/app/src/lib/api.ts (goalsApi.objectives - lines 105-109)
 *   - web/app/src/pages/Dashboard.tsx
 */
import { Controller, Get, Post, Put, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ObjectiveService } from './objective.service';
import { CreateObjectiveDto, UpdateObjectiveDto, ObjectiveResponseDto } from './dto/objective.dto';
import { ObjectiveStatus } from './entities/objective.entity';

@ApiTags('objectives')
@Controller('objectives')
export class ObjectiveController {
  constructor(private readonly objectiveService: ObjectiveService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new objective' })
  @ApiResponse({ status: 201, type: ObjectiveResponseDto })
  async create(@Body() dto: CreateObjectiveDto): Promise<ObjectiveResponseDto> {
    const objective = await this.objectiveService.create(dto);
    return objective as ObjectiveResponseDto;
  }

  @Get()
  @ApiOperation({ summary: 'List objectives with filters' })
  @ApiResponse({ status: 200, type: [ObjectiveResponseDto] })
  async findAll(
    @Query('ownerId') ownerId?: string,
    @Query('timeFrame') timeFrame?: string,
    @Query('status') status?: ObjectiveStatus,
  ): Promise<ObjectiveResponseDto[]> {
    const objectives = await this.objectiveService.findAll(ownerId, timeFrame, status);
    return objectives as ObjectiveResponseDto[];
  }

  @Get(':objectiveId')
  @ApiOperation({ summary: 'Get objective by ID' })
  @ApiResponse({ status: 200, type: ObjectiveResponseDto })
  async findOne(@Param('objectiveId') objectiveId: string): Promise<ObjectiveResponseDto> {
    const objective = await this.objectiveService.findOne(objectiveId);
    return objective as ObjectiveResponseDto;
  }

  @Put(':objectiveId')
  @ApiOperation({ summary: 'Update objective' })
  @ApiResponse({ status: 200, type: ObjectiveResponseDto })
  async update(
    @Param('objectiveId') objectiveId: string,
    @Body() dto: UpdateObjectiveDto,
  ): Promise<ObjectiveResponseDto> {
    const objective = await this.objectiveService.update(objectiveId, dto);
    return objective as ObjectiveResponseDto;
  }

  @Post(':objectiveId/archive')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archive objective' })
  @ApiResponse({ status: 200, type: ObjectiveResponseDto })
  async archive(@Param('objectiveId') objectiveId: string): Promise<ObjectiveResponseDto> {
    const objective = await this.objectiveService.archive(objectiveId);
    return objective as ObjectiveResponseDto;
  }

  @Put(':objectiveId/key-results/:keyResultId/progress')
  @ApiOperation({ summary: 'Update key result progress' })
  async updateKeyResultProgress(
    @Param('keyResultId') keyResultId: string,
    @Body('currentValue') currentValue: number,
  ) {
    return this.objectiveService.updateKeyResultProgress(keyResultId, currentValue);
  }
}
