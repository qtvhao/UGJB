/**
 * Associated Frontend Files:
 *   - web/app/src/lib/api.ts (projectApi.tasks - lines 124-128)
 *   - web/app/src/pages/Dashboard.tsx
 */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Task, TaskStatus } from './entities/task.entity';
import {
  CreateTaskDto,
  UpdateTaskDto,
  AssignTaskDto,
  TaskFilterDto,
  AutoAssignTaskDto,
  BulkAssignTasksDto,
  PaginatedTaskResponseDto,
} from './dto/task.dto';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectQueue('task-assignment')
    private readonly taskAssignmentQueue: Queue,
  ) {}

  /**
   * Create a new task
   */
  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    try {
      const task = this.taskRepository.create({
        ...createTaskDto,
        status: TaskStatus.UNASSIGNED,
        skillsRequired: createTaskDto.skillsRequired || [],
      });

      const savedTask = await this.taskRepository.save(task);
      this.logger.log(`Task created: ${savedTask.id}`);

      return savedTask;
    } catch (error) {
      this.logger.error(`Failed to create task: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to create task');
    }
  }

  /**
   * Find all tasks with optional filters and pagination
   */
  async findAll(filters: TaskFilterDto): Promise<PaginatedTaskResponseDto> {
    const {
      status,
      priority,
      assigneeId,
      projectId,
      sprintId,
      unassignedOnly,
      page = 1,
      limit = 20,
    } = filters;

    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .where('task.isDeleted = :isDeleted', { isDeleted: false });

    if (status) {
      queryBuilder.andWhere('task.status = :status', { status });
    }

    if (priority) {
      queryBuilder.andWhere('task.priority = :priority', { priority });
    }

    if (assigneeId) {
      queryBuilder.andWhere('task.assigneeId = :assigneeId', { assigneeId });
    }

    if (projectId) {
      queryBuilder.andWhere('task.projectId = :projectId', { projectId });
    }

    if (sprintId) {
      queryBuilder.andWhere('task.sprintId = :sprintId', { sprintId });
    }

    if (unassignedOnly) {
      queryBuilder.andWhere('task.assigneeId IS NULL');
    }

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy('task.priority', 'DESC');
    queryBuilder.addOrderBy('task.createdAt', 'ASC');

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data: data as any,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find a task by ID
   */
  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  /**
   * Update a task
   */
  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);

    // Update status-related timestamps
    if (updateTaskDto.status) {
      if (updateTaskDto.status === TaskStatus.IN_PROGRESS && !task.startedAt) {
        task.startedAt = new Date();
      }

      if (updateTaskDto.status === TaskStatus.COMPLETED && !task.completedAt) {
        task.completedAt = new Date();
      }
    }

    Object.assign(task, updateTaskDto);

    const updatedTask = await this.taskRepository.save(task);
    this.logger.log(`Task updated: ${updatedTask.id}`);

    return updatedTask;
  }

  /**
   * Assign a task to a team member
   */
  async assignTask(id: string, assignTaskDto: AssignTaskDto): Promise<Task> {
    const task = await this.findOne(id);

    if (task.status === TaskStatus.COMPLETED) {
      throw new BadRequestException('Cannot assign a completed task');
    }

    task.assigneeId = assignTaskDto.assigneeId;
    task.assigneeName = assignTaskDto.assigneeName;
    task.assigneeEmail = assignTaskDto.assigneeEmail;
    task.status = TaskStatus.ASSIGNED;
    task.updatedBy = assignTaskDto.updatedBy;

    const updatedTask = await this.taskRepository.save(task);
    this.logger.log(`Task ${id} assigned to ${assignTaskDto.assigneeName}`);

    // Queue notification job
    await this.taskAssignmentQueue.add('task-assigned', {
      taskId: updatedTask.id,
      assigneeId: updatedTask.assigneeId,
      assigneeName: updatedTask.assigneeName,
      assigneeEmail: updatedTask.assigneeEmail,
      taskTitle: updatedTask.title,
    });

    return updatedTask;
  }

  /**
   * Auto-assign a task based on skills and availability
   */
  async autoAssignTask(autoAssignDto: AutoAssignTaskDto): Promise<Task> {
    const task = await this.findOne(autoAssignDto.taskId);

    if (task.assigneeId) {
      throw new BadRequestException('Task is already assigned');
    }

    // Add auto-assignment job to queue
    const job = await this.taskAssignmentQueue.add('auto-assign', {
      taskId: task.id,
      skillsRequired: task.skillsRequired,
      candidateAssigneeIds: autoAssignDto.candidateAssigneeIds,
      priority: task.priority,
    });

    this.logger.log(`Auto-assignment job queued for task ${task.id}: ${job.id}`);

    // In a real implementation, this would wait for the queue processor
    // For now, return the task with updated status
    task.metadata = {
      ...task.metadata,
      autoAssignmentJobId: job.id,
      autoAssignmentStatus: 'pending',
    };

    return await this.taskRepository.save(task);
  }

  /**
   * Bulk assign multiple tasks to a team member
   */
  async bulkAssignTasks(
    bulkAssignDto: BulkAssignTasksDto,
  ): Promise<{ assigned: number; failed: string[] }> {
    const tasks = await this.taskRepository.find({
      where: {
        id: In(bulkAssignDto.taskIds),
        isDeleted: false,
      },
    });

    const failed: string[] = [];
    let assigned = 0;

    for (const task of tasks) {
      try {
        if (task.status === TaskStatus.COMPLETED) {
          failed.push(task.id);
          continue;
        }

        task.assigneeId = bulkAssignDto.assigneeId;
        task.assigneeName = bulkAssignDto.assigneeName;
        task.assigneeEmail = bulkAssignDto.assigneeEmail;
        task.status = TaskStatus.ASSIGNED;
        task.updatedBy = bulkAssignDto.updatedBy;

        await this.taskRepository.save(task);
        assigned++;

        // Queue notification
        await this.taskAssignmentQueue.add('task-assigned', {
          taskId: task.id,
          assigneeId: task.assigneeId,
          assigneeName: task.assigneeName,
          assigneeEmail: task.assigneeEmail,
          taskTitle: task.title,
        });
      } catch (error) {
        this.logger.error(`Failed to assign task ${task.id}`, error.stack);
        failed.push(task.id);
      }
    }

    this.logger.log(
      `Bulk assignment: ${assigned} assigned, ${failed.length} failed`,
    );

    return { assigned, failed };
  }

  /**
   * Unassign a task
   */
  async unassignTask(id: string, updatedBy?: string): Promise<Task> {
    const task = await this.findOne(id);

    if (!task.assigneeId) {
      throw new BadRequestException('Task is not assigned');
    }

    task.assigneeId = null;
    task.assigneeName = null;
    task.assigneeEmail = null;
    task.status = TaskStatus.UNASSIGNED;
    task.updatedBy = updatedBy;

    const updatedTask = await this.taskRepository.save(task);
    this.logger.log(`Task ${id} unassigned`);

    return updatedTask;
  }

  /**
   * Get tasks by assignee
   */
  async getTasksByAssignee(assigneeId: string): Promise<Task[]> {
    return await this.taskRepository.find({
      where: {
        assigneeId,
        isDeleted: false,
      },
      order: {
        priority: 'DESC',
        createdAt: 'ASC',
      },
    });
  }

  /**
   * Get unassigned tasks
   */
  async getUnassignedTasks(projectId?: string): Promise<Task[]> {
    const where: any = {
      assigneeId: null,
      status: TaskStatus.UNASSIGNED,
      isDeleted: false,
    };

    if (projectId) {
      where.projectId = projectId;
    }

    return await this.taskRepository.find({
      where,
      order: {
        priority: 'DESC',
        createdAt: 'ASC',
      },
    });
  }

  /**
   * Soft delete a task
   */
  async remove(id: string, deletedBy?: string): Promise<void> {
    const task = await this.findOne(id);

    task.isDeleted = true;
    task.deletedAt = new Date();
    task.updatedBy = deletedBy;

    await this.taskRepository.save(task);
    this.logger.log(`Task ${id} deleted`);
  }

  /**
   * Get task statistics
   */
  async getTaskStatistics(projectId?: string): Promise<any> {
    const where: any = { isDeleted: false };
    if (projectId) {
      where.projectId = projectId;
    }

    const total = await this.taskRepository.count({ where });

    const byStatus = await this.taskRepository
      .createQueryBuilder('task')
      .select('task.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('task.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere(projectId ? 'task.projectId = :projectId' : '1=1', { projectId })
      .groupBy('task.status')
      .getRawMany();

    const byPriority = await this.taskRepository
      .createQueryBuilder('task')
      .select('task.priority', 'priority')
      .addSelect('COUNT(*)', 'count')
      .where('task.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere(projectId ? 'task.projectId = :projectId' : '1=1', { projectId })
      .groupBy('task.priority')
      .getRawMany();

    const unassigned = await this.taskRepository.count({
      where: { ...where, assigneeId: null },
    });

    return {
      total,
      unassigned,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = parseInt(item.count, 10);
        return acc;
      }, {}),
      byPriority: byPriority.reduce((acc, item) => {
        acc[item.priority] = parseInt(item.count, 10);
        return acc;
      }, {}),
    };
  }
}
