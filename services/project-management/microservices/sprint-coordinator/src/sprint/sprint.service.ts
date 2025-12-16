/**
 * Associated Frontend Files:
 *   - web/app/src/lib/api.ts (projectApi.sprints - lines 118-122)
 *   - web/app/src/pages/projects/SprintsPage.tsx
 */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, IsNull } from 'typeorm';
import { Sprint, SprintStatus } from './entities/sprint.entity';
import { CreateSprintDto, UpdateSprintDto, SprintQueryDto } from './dto/sprint.dto';

@Injectable()
export class SprintService {
  private readonly logger = new Logger(SprintService.name);

  constructor(
    @InjectRepository(Sprint)
    private readonly sprintRepository: Repository<Sprint>,
  ) {}

  async create(createSprintDto: CreateSprintDto): Promise<Sprint> {
    this.logger.log(`Creating new sprint: ${createSprintDto.name}`);

    // Validate dates
    if (new Date(createSprintDto.endDate) <= new Date(createSprintDto.startDate)) {
      throw new BadRequestException('End date must be after start date');
    }

    // Calculate duration if not provided
    if (!createSprintDto.durationDays) {
      const start = new Date(createSprintDto.startDate);
      const end = new Date(createSprintDto.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      createSprintDto.durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Calculate capacities if team members provided
    if (createSprintDto.teamMembers && createSprintDto.teamMembers.length > 0) {
      createSprintDto.teamSize = createSprintDto.teamMembers.length;
      createSprintDto.totalCapacity = createSprintDto.teamMembers.reduce(
        (sum, member) => sum + member.capacity,
        0,
      );
      createSprintDto.allocatedCapacity = createSprintDto.teamMembers.reduce(
        (sum, member) => sum + member.allocation,
        0,
      );
      createSprintDto.remainingCapacity =
        createSprintDto.totalCapacity - createSprintDto.allocatedCapacity;
    }

    const sprint = this.sprintRepository.create(createSprintDto);
    const savedSprint = await this.sprintRepository.save(sprint);

    this.logger.log(`Sprint created successfully with ID: ${savedSprint.id}`);
    return savedSprint;
  }

  async findAll(query: SprintQueryDto): Promise<{ data: Sprint[]; total: number }> {
    const { projectId, status, page = 1, limit = 10 } = query;

    const where: FindOptionsWhere<Sprint> = {
      deletedAt: IsNull(),
    };

    if (projectId) {
      where.projectId = projectId;
    }

    if (status) {
      where.status = status;
    }

    const [data, total] = await this.sprintRepository.findAndCount({
      where,
      order: { startDate: 'DESC', createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    this.logger.log(`Retrieved ${data.length} sprints (total: ${total})`);
    return { data, total };
  }

  async findOne(id: string): Promise<Sprint> {
    const sprint = await this.sprintRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!sprint) {
      throw new NotFoundException(`Sprint with ID ${id} not found`);
    }

    return sprint;
  }

  async findByProject(projectId: string): Promise<Sprint[]> {
    const sprints = await this.sprintRepository.find({
      where: { projectId, deletedAt: IsNull() },
      order: { startDate: 'DESC' },
    });

    this.logger.log(`Retrieved ${sprints.length} sprints for project ${projectId}`);
    return sprints;
  }

  async findActiveSprints(): Promise<Sprint[]> {
    const sprints = await this.sprintRepository.find({
      where: { status: SprintStatus.ACTIVE, deletedAt: IsNull() },
      order: { startDate: 'ASC' },
    });

    this.logger.log(`Retrieved ${sprints.length} active sprints`);
    return sprints;
  }

  async update(id: string, updateSprintDto: UpdateSprintDto): Promise<Sprint> {
    this.logger.log(`Updating sprint: ${id}`);

    const sprint = await this.findOne(id);

    // Validate dates if both are being updated
    if (updateSprintDto.startDate && updateSprintDto.endDate) {
      if (new Date(updateSprintDto.endDate) <= new Date(updateSprintDto.startDate)) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    // Recalculate duration if dates changed
    if (updateSprintDto.startDate || updateSprintDto.endDate) {
      const startDate = updateSprintDto.startDate
        ? new Date(updateSprintDto.startDate)
        : sprint.startDate;
      const endDate = updateSprintDto.endDate ? new Date(updateSprintDto.endDate) : sprint.endDate;
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      updateSprintDto.durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Recalculate capacities if team members updated
    if (updateSprintDto.teamMembers) {
      updateSprintDto.teamSize = updateSprintDto.teamMembers.length;
      updateSprintDto.totalCapacity = updateSprintDto.teamMembers.reduce(
        (sum, member) => sum + member.capacity,
        0,
      );
      updateSprintDto.allocatedCapacity = updateSprintDto.teamMembers.reduce(
        (sum, member) => sum + member.allocation,
        0,
      );
      updateSprintDto.remainingCapacity =
        updateSprintDto.totalCapacity - updateSprintDto.allocatedCapacity;
    }

    Object.assign(sprint, updateSprintDto);
    const updatedSprint = await this.sprintRepository.save(sprint);

    this.logger.log(`Sprint ${id} updated successfully`);
    return updatedSprint;
  }

  async updateStatus(id: string, status: SprintStatus): Promise<Sprint> {
    this.logger.log(`Updating sprint ${id} status to ${status}`);

    const sprint = await this.findOne(id);

    // Validate status transitions
    if (sprint.status === SprintStatus.COMPLETED && status !== SprintStatus.COMPLETED) {
      throw new BadRequestException('Cannot change status of a completed sprint');
    }

    if (sprint.status === SprintStatus.CANCELLED && status !== SprintStatus.CANCELLED) {
      throw new BadRequestException('Cannot change status of a cancelled sprint');
    }

    sprint.status = status;
    const updatedSprint = await this.sprintRepository.save(sprint);

    this.logger.log(`Sprint ${id} status updated to ${status}`);
    return updatedSprint;
  }

  async updateCapacity(
    id: string,
    capacityData: {
      totalCapacity?: number;
      allocatedCapacity?: number;
    },
  ): Promise<Sprint> {
    this.logger.log(`Updating capacity for sprint ${id}`);

    const sprint = await this.findOne(id);

    if (capacityData.totalCapacity !== undefined) {
      sprint.totalCapacity = capacityData.totalCapacity;
    }

    if (capacityData.allocatedCapacity !== undefined) {
      sprint.allocatedCapacity = capacityData.allocatedCapacity;
    }

    sprint.remainingCapacity = sprint.totalCapacity - sprint.allocatedCapacity;

    if (sprint.remainingCapacity < 0) {
      throw new BadRequestException(
        'Allocated capacity cannot exceed total capacity',
      );
    }

    const updatedSprint = await this.sprintRepository.save(sprint);

    this.logger.log(`Sprint ${id} capacity updated successfully`);
    return updatedSprint;
  }

  async delete(id: string): Promise<void> {
    this.logger.log(`Soft deleting sprint: ${id}`);

    const sprint = await this.findOne(id);
    sprint.deletedAt = new Date();
    await this.sprintRepository.save(sprint);

    this.logger.log(`Sprint ${id} deleted successfully`);
  }

  async hardDelete(id: string): Promise<void> {
    this.logger.log(`Hard deleting sprint: ${id}`);

    const result = await this.sprintRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Sprint with ID ${id} not found`);
    }

    this.logger.log(`Sprint ${id} permanently deleted`);
  }

  async getSprintMetrics(id: string): Promise<any> {
    const sprint = await this.findOne(id);

    const now = new Date();
    const daysElapsed = Math.floor(
      (now.getTime() - sprint.startDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    const daysRemaining = Math.max(
      0,
      Math.floor((sprint.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    );
    const progressPercentage =
      sprint.durationDays > 0 ? (daysElapsed / sprint.durationDays) * 100 : 0;

    return {
      sprintId: sprint.id,
      sprintName: sprint.name,
      status: sprint.status,
      duration: {
        totalDays: sprint.durationDays,
        daysElapsed,
        daysRemaining,
        progressPercentage: Math.min(100, Math.max(0, progressPercentage)),
      },
      capacity: {
        total: sprint.totalCapacity,
        allocated: sprint.allocatedCapacity,
        remaining: sprint.remainingCapacity,
        utilizationPercentage:
          sprint.totalCapacity > 0
            ? (sprint.allocatedCapacity / sprint.totalCapacity) * 100
            : 0,
      },
      team: {
        size: sprint.teamSize,
        members: sprint.teamMembers || [],
      },
      goals: sprint.goals || [],
      metrics: sprint.metrics || {
        velocity: 0,
        completedStoryPoints: 0,
        plannedStoryPoints: 0,
        burndownRate: 0,
      },
    };
  }
}
