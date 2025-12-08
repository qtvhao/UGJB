import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { SprintService } from './sprint.service';
import {
  CreateSprintDto,
  UpdateSprintDto,
  SprintQueryDto,
} from './dto/sprint.dto';
import { SprintStatus } from './entities/sprint.entity';

@Controller('sprints')
export class SprintController {
  private readonly logger = new Logger(SprintController.name);

  constructor(private readonly sprintService: SprintService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createSprintDto: CreateSprintDto) {
    this.logger.log(`POST /sprints - Creating sprint: ${createSprintDto.name}`);
    return this.sprintService.create(createSprintDto);
  }

  @Get()
  async findAll(@Query() query: SprintQueryDto) {
    this.logger.log(`GET /sprints - Query params: ${JSON.stringify(query)}`);
    return this.sprintService.findAll(query);
  }

  @Get('active')
  async findActiveSprints() {
    this.logger.log('GET /sprints/active - Fetching active sprints');
    return this.sprintService.findActiveSprints();
  }

  @Get('project/:projectId')
  async findByProject(@Param('projectId') projectId: string) {
    this.logger.log(`GET /sprints/project/${projectId} - Fetching sprints for project`);
    return this.sprintService.findByProject(projectId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`GET /sprints/${id} - Fetching sprint`);
    return this.sprintService.findOne(id);
  }

  @Get(':id/metrics')
  async getMetrics(@Param('id') id: string) {
    this.logger.log(`GET /sprints/${id}/metrics - Fetching sprint metrics`);
    return this.sprintService.getSprintMetrics(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateSprintDto: UpdateSprintDto) {
    this.logger.log(`PUT /sprints/${id} - Updating sprint`);
    return this.sprintService.update(id, updateSprintDto);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: SprintStatus,
  ) {
    this.logger.log(`PATCH /sprints/${id}/status - Updating status to ${status}`);
    return this.sprintService.updateStatus(id, status);
  }

  @Patch(':id/capacity')
  async updateCapacity(
    @Param('id') id: string,
    @Body()
    capacityData: {
      totalCapacity?: number;
      allocatedCapacity?: number;
    },
  ) {
    this.logger.log(`PATCH /sprints/${id}/capacity - Updating capacity`);
    return this.sprintService.updateCapacity(id, capacityData);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    this.logger.log(`DELETE /sprints/${id} - Soft deleting sprint`);
    await this.sprintService.delete(id);
  }

  @Delete(':id/permanent')
  @HttpCode(HttpStatus.NO_CONTENT)
  async hardDelete(@Param('id') id: string) {
    this.logger.log(`DELETE /sprints/${id}/permanent - Hard deleting sprint`);
    await this.sprintService.hardDelete(id);
  }
}
