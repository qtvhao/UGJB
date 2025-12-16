/**
 * Associated Frontend Files:
 *   - web/app/src/lib/api.ts (goalsApi.objectives - lines 105-109)
 *   - web/app/src/pages/Dashboard.tsx
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Objective, ObjectiveStatus } from './entities/objective.entity';
import { KeyResult } from './entities/key-result.entity';
import { CreateObjectiveDto, UpdateObjectiveDto } from './dto/objective.dto';

@Injectable()
export class ObjectiveService {
  constructor(
    @InjectRepository(Objective)
    private objectiveRepository: Repository<Objective>,
    @InjectRepository(KeyResult)
    private keyResultRepository: Repository<KeyResult>,
  ) {}

  async create(dto: CreateObjectiveDto): Promise<Objective> {
    const objective = this.objectiveRepository.create({
      title: dto.title,
      description: dto.description,
      ownerId: dto.ownerId,
      timeFrame: dto.timeFrame,
      parentObjectiveId: dto.parentObjectiveId,
      status: ObjectiveStatus.DRAFT,
    });

    const savedObjective = await this.objectiveRepository.save(objective);

    if (dto.keyResults && dto.keyResults.length > 0) {
      const keyResults = dto.keyResults.map((kr) =>
        this.keyResultRepository.create({
          ...kr,
          objectiveId: savedObjective.objectiveId,
          currentValue: kr.startValue || 0,
        }),
      );
      await this.keyResultRepository.save(keyResults);
    }

    return this.findOne(savedObjective.objectiveId);
  }

  async findAll(ownerId?: string, timeFrame?: string, status?: ObjectiveStatus): Promise<Objective[]> {
    const query = this.objectiveRepository
      .createQueryBuilder('objective')
      .leftJoinAndSelect('objective.keyResults', 'keyResults');

    if (ownerId) {
      query.andWhere('objective.ownerId = :ownerId', { ownerId });
    }
    if (timeFrame) {
      query.andWhere('objective.timeFrame = :timeFrame', { timeFrame });
    }
    if (status) {
      query.andWhere('objective.status = :status', { status });
    }

    return query.orderBy('objective.createdAt', 'DESC').getMany();
  }

  async findOne(objectiveId: string): Promise<Objective> {
    const objective = await this.objectiveRepository.findOne({
      where: { objectiveId },
      relations: ['keyResults'],
    });

    if (!objective) {
      throw new NotFoundException(`Objective not found: ${objectiveId}`);
    }

    return objective;
  }

  async update(objectiveId: string, dto: UpdateObjectiveDto): Promise<Objective> {
    const objective = await this.findOne(objectiveId);

    if (dto.title !== undefined) objective.title = dto.title;
    if (dto.description !== undefined) objective.description = dto.description;
    if (dto.status !== undefined) objective.status = dto.status;
    if (dto.progress !== undefined) objective.progress = dto.progress;

    await this.objectiveRepository.save(objective);
    return this.findOne(objectiveId);
  }

  async archive(objectiveId: string): Promise<Objective> {
    return this.update(objectiveId, { status: ObjectiveStatus.ARCHIVED });
  }

  async updateKeyResultProgress(keyResultId: string, currentValue: number): Promise<KeyResult> {
    const keyResult = await this.keyResultRepository.findOne({ where: { keyResultId } });
    if (!keyResult) {
      throw new NotFoundException(`KeyResult not found: ${keyResultId}`);
    }

    keyResult.currentValue = currentValue;
    await this.keyResultRepository.save(keyResult);

    // Recalculate objective progress
    await this.recalculateObjectiveProgress(keyResult.objectiveId);

    return keyResult;
  }

  private async recalculateObjectiveProgress(objectiveId: string): Promise<void> {
    const objective = await this.findOne(objectiveId);
    if (!objective.keyResults || objective.keyResults.length === 0) return;

    let totalProgress = 0;
    for (const kr of objective.keyResults) {
      if (kr.targetValue && kr.targetValue !== kr.startValue) {
        const krProgress = ((kr.currentValue || 0) - (kr.startValue || 0)) / (kr.targetValue - (kr.startValue || 0)) * 100;
        totalProgress += Math.min(100, Math.max(0, krProgress));
      }
    }

    objective.progress = totalProgress / objective.keyResults.length;
    await this.objectiveRepository.save(objective);
  }
}
