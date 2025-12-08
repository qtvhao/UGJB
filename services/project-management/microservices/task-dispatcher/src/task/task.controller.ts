import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TaskService } from './task.service';
import {
  CreateTaskDto,
  UpdateTaskDto,
  AssignTaskDto,
  TaskFilterDto,
  AutoAssignTaskDto,
  BulkAssignTasksDto,
  PaginatedTaskResponseDto,
} from './dto/task.dto';
import { Task } from './entities/task.entity';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTaskDto: CreateTaskDto): Promise<Task> {
    return await this.taskService.create(createTaskDto);
  }

  @Get()
  async findAll(@Query() filters: TaskFilterDto): Promise<PaginatedTaskResponseDto> {
    return await this.taskService.findAll(filters);
  }

  @Get('unassigned')
  async getUnassignedTasks(@Query('projectId') projectId?: string): Promise<Task[]> {
    return await this.taskService.getUnassignedTasks(projectId);
  }

  @Get('statistics')
  async getStatistics(@Query('projectId') projectId?: string): Promise<any> {
    return await this.taskService.getTaskStatistics(projectId);
  }

  @Get('assignee/:assigneeId')
  async getTasksByAssignee(@Param('assigneeId') assigneeId: string): Promise<Task[]> {
    return await this.taskService.getTasksByAssignee(assigneeId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Task> {
    return await this.taskService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    return await this.taskService.update(id, updateTaskDto);
  }

  @Post(':id/assign')
  @HttpCode(HttpStatus.OK)
  async assignTask(
    @Param('id') id: string,
    @Body() assignTaskDto: AssignTaskDto,
  ): Promise<Task> {
    return await this.taskService.assignTask(id, assignTaskDto);
  }

  @Post(':id/unassign')
  @HttpCode(HttpStatus.OK)
  async unassignTask(
    @Param('id') id: string,
    @Body('updatedBy') updatedBy?: string,
  ): Promise<Task> {
    return await this.taskService.unassignTask(id, updatedBy);
  }

  @Post('auto-assign')
  @HttpCode(HttpStatus.OK)
  async autoAssignTask(@Body() autoAssignDto: AutoAssignTaskDto): Promise<Task> {
    return await this.taskService.autoAssignTask(autoAssignDto);
  }

  @Post('bulk-assign')
  @HttpCode(HttpStatus.OK)
  async bulkAssignTasks(
    @Body() bulkAssignDto: BulkAssignTasksDto,
  ): Promise<{ assigned: number; failed: string[] }> {
    return await this.taskService.bulkAssignTasks(bulkAssignDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @Body('deletedBy') deletedBy?: string,
  ): Promise<void> {
    return await this.taskService.remove(id, deletedBy);
  }
}
