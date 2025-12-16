/**
 * Associated Frontend Files:
 *   - web/app/src/lib/api.ts (goalsApi.keyResults - lines 111-113)
 *   - web/app/src/pages/Dashboard.tsx
 */
import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  KeyResultProgress,
  ProgressStatus,
  MetricType,
} from './entities/key-result-progress.entity';
import {
  CreateKeyResultProgressDto,
  UpdateKeyResultProgressDto,
  MetricUpdateWebhookDto,
  ProgressQueryDto,
  KeyResultProgressResponseDto,
  ProgressSummaryDto,
  BulkMetricUpdateDto,
} from './dto/key-result.dto';

@Injectable()
export class KeyResultService {
  private readonly logger = new Logger(KeyResultService.name);

  constructor(
    @InjectRepository(KeyResultProgress)
    private readonly progressRepository: Repository<KeyResultProgress>,

    @InjectQueue('key-result-metrics-update')
    private readonly metricsQueue: Queue,

    @InjectQueue('key-result-progress-calculation')
    private readonly calculationQueue: Queue,
  ) {}

  /**
   * Create a new progress record for a key result
   */
  async createProgress(
    createDto: CreateKeyResultProgressDto,
  ): Promise<KeyResultProgressResponseDto> {
    this.logger.log(`Creating progress record for key result: ${createDto.keyResultId}`);

    // Mark previous records as not latest
    await this.progressRepository.update(
      { keyResultId: createDto.keyResultId, isLatest: true },
      { isLatest: false },
    );

    const progressPercentage = this.calculateProgressPercentage(
      createDto.startingValue || 0,
      createDto.currentValue,
      createDto.targetValue,
    );

    const status = this.determineStatus(
      progressPercentage,
      createDto.dueDate,
      createDto.currentValue,
      createDto.targetValue,
    );

    const progress = this.progressRepository.create({
      ...createDto,
      startingValue: createDto.startingValue || 0,
      progressPercentage,
      status,
      recordedAt: createDto.recordedAt ? new Date(createDto.recordedAt) : new Date(),
      dueDate: createDto.dueDate ? new Date(createDto.dueDate) : undefined,
      isLatest: true,
      version: 1,
    });

    const saved = await this.progressRepository.save(progress);

    // Queue async calculation job
    await this.calculationQueue.add('calculate-trends', {
      keyResultId: saved.keyResultId,
      progressId: saved.id,
    });

    this.logger.log(`Progress record created: ${saved.id}`);
    return this.mapToResponseDto(saved);
  }

  /**
   * Update existing progress record
   */
  async updateProgress(
    id: string,
    updateDto: UpdateKeyResultProgressDto,
  ): Promise<KeyResultProgressResponseDto> {
    this.logger.log(`Updating progress record: ${id}`);

    const progress = await this.progressRepository.findOne({ where: { id } });
    if (!progress) {
      throw new NotFoundException(`Progress record not found: ${id}`);
    }

    // Create new version if updating current value
    if (updateDto.currentValue !== undefined && updateDto.currentValue !== progress.currentValue) {
      return this.createProgressVersion(progress, updateDto);
    }

    // Update metadata only
    Object.assign(progress, updateDto);

    if (updateDto.currentValue !== undefined) {
      progress.progressPercentage = this.calculateProgressPercentage(
        progress.startingValue,
        updateDto.currentValue,
        progress.targetValue,
      );
      progress.status = this.determineStatus(
        progress.progressPercentage,
        progress.dueDate?.toISOString(),
        updateDto.currentValue,
        progress.targetValue,
      );
    }

    progress.recordedAt = updateDto.recordedAt ? new Date(updateDto.recordedAt) : new Date();

    const updated = await this.progressRepository.save(progress);
    this.logger.log(`Progress record updated: ${id}`);

    return this.mapToResponseDto(updated);
  }

  /**
   * Handle metric update webhook
   */
  async handleMetricWebhook(
    webhookDto: MetricUpdateWebhookDto,
  ): Promise<KeyResultProgressResponseDto> {
    this.logger.log(`Processing metric webhook for key result: ${webhookDto.keyResultId}`);

    // Get latest progress record
    const latestProgress = await this.progressRepository.findOne({
      where: { keyResultId: webhookDto.keyResultId, isLatest: true },
    });

    if (!latestProgress) {
      throw new NotFoundException(
        `No progress record found for key result: ${webhookDto.keyResultId}`,
      );
    }

    // Queue the metric update for async processing
    await this.metricsQueue.add('process-metric-update', {
      keyResultId: webhookDto.keyResultId,
      metricValue: webhookDto.metricValue,
      source: webhookDto.source || 'webhook',
      metadata: webhookDto.metadata,
      timestamp: webhookDto.timestamp || new Date().toISOString(),
      comment: webhookDto.comment,
    });

    // Create immediate update
    const updateDto: UpdateKeyResultProgressDto = {
      currentValue: webhookDto.metricValue,
      updateSource: webhookDto.source || 'webhook',
      metricMetadata: webhookDto.metadata,
      comment: webhookDto.comment,
      recordedAt: webhookDto.timestamp || new Date().toISOString(),
    };

    return this.updateProgress(latestProgress.id, updateDto);
  }

  /**
   * Handle bulk metric updates
   */
  async handleBulkMetricWebhook(
    bulkDto: BulkMetricUpdateDto,
  ): Promise<{ processed: number; failed: number; results: any[] }> {
    this.logger.log(`Processing bulk metric webhook with ${bulkDto.updates.length} updates`);

    const results = [];
    let processed = 0;
    let failed = 0;

    for (const update of bulkDto.updates) {
      try {
        const result = await this.handleMetricWebhook(update);
        results.push({ keyResultId: update.keyResultId, success: true, data: result });
        processed++;
      } catch (error) {
        this.logger.error(
          `Failed to process metric update for ${update.keyResultId}: ${error.message}`,
        );
        results.push({
          keyResultId: update.keyResultId,
          success: false,
          error: error.message,
        });
        failed++;
      }
    }

    return { processed, failed, results };
  }

  /**
   * Get progress records with filtering
   */
  async getProgress(query: ProgressQueryDto): Promise<{
    data: KeyResultProgressResponseDto[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const {
      keyResultId,
      objectiveId,
      status,
      startDate,
      endDate,
      latestOnly,
      limit = 50,
      offset = 0,
    } = query;

    const where: any = {};

    if (keyResultId) where.keyResultId = keyResultId;
    if (objectiveId) where.objectiveId = objectiveId;
    if (status) where.status = status;
    if (latestOnly) where.isLatest = true;

    if (startDate && endDate) {
      where.recordedAt = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      where.recordedAt = MoreThanOrEqual(new Date(startDate));
    } else if (endDate) {
      where.recordedAt = LessThanOrEqual(new Date(endDate));
    }

    const [data, total] = await this.progressRepository.findAndCount({
      where,
      order: { recordedAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return {
      data: data.map(p => this.mapToResponseDto(p)),
      total,
      limit,
      offset,
    };
  }

  /**
   * Get progress by ID
   */
  async getProgressById(id: string): Promise<KeyResultProgressResponseDto> {
    const progress = await this.progressRepository.findOne({ where: { id } });
    if (!progress) {
      throw new NotFoundException(`Progress record not found: ${id}`);
    }
    return this.mapToResponseDto(progress);
  }

  /**
   * Get latest progress for a key result
   */
  async getLatestProgress(keyResultId: string): Promise<KeyResultProgressResponseDto> {
    const progress = await this.progressRepository.findOne({
      where: { keyResultId, isLatest: true },
    });

    if (!progress) {
      throw new NotFoundException(`No progress found for key result: ${keyResultId}`);
    }

    return this.mapToResponseDto(progress);
  }

  /**
   * Get progress summary for a key result
   */
  async getProgressSummary(keyResultId: string): Promise<ProgressSummaryDto> {
    const records = await this.progressRepository.find({
      where: { keyResultId },
      order: { recordedAt: 'ASC' },
    });

    if (records.length === 0) {
      throw new NotFoundException(`No progress found for key result: ${keyResultId}`);
    }

    const latest = records[records.length - 1];
    const oldest = records[0];

    // Calculate average progress rate
    let averageProgressRate: number | undefined;
    if (records.length > 1) {
      const daysDiff = Math.max(
        1,
        (latest.recordedAt.getTime() - oldest.recordedAt.getTime()) / (1000 * 60 * 60 * 24),
      );
      const progressDiff = latest.progressPercentage - oldest.progressPercentage;
      averageProgressRate = progressDiff / daysDiff;
    }

    // Estimate completion date
    let estimatedCompletionDate: Date | undefined;
    if (averageProgressRate && averageProgressRate > 0 && latest.progressPercentage < 100) {
      const remainingProgress = 100 - latest.progressPercentage;
      const daysToComplete = remainingProgress / averageProgressRate;
      estimatedCompletionDate = new Date(
        latest.recordedAt.getTime() + daysToComplete * 24 * 60 * 60 * 1000,
      );
    }

    const isOnTrack = this.isProgressOnTrack(
      latest.progressPercentage,
      latest.dueDate,
      estimatedCompletionDate,
    );

    return {
      keyResultId: latest.keyResultId,
      objectiveId: latest.objectiveId,
      keyResultName: latest.keyResultName,
      currentProgress: latest.progressPercentage,
      status: latest.status,
      totalUpdates: records.length,
      lastUpdated: latest.recordedAt,
      averageProgressRate,
      estimatedCompletionDate,
      daysUntilDue: latest.daysUntilDue,
      isOnTrack,
    };
  }

  /**
   * Delete progress record (soft delete)
   */
  async deleteProgress(id: string): Promise<void> {
    const progress = await this.progressRepository.findOne({ where: { id } });
    if (!progress) {
      throw new NotFoundException(`Progress record not found: ${id}`);
    }

    progress.deletedAt = new Date();
    await this.progressRepository.save(progress);
    this.logger.log(`Progress record soft deleted: ${id}`);
  }

  // Helper methods

  private async createProgressVersion(
    currentProgress: KeyResultProgress,
    updateDto: UpdateKeyResultProgressDto,
  ): Promise<KeyResultProgressResponseDto> {
    // Mark current as not latest
    currentProgress.isLatest = false;
    await this.progressRepository.save(currentProgress);

    // Create new version
    const newVersion = this.progressRepository.create({
      ...currentProgress,
      id: undefined, // Generate new ID
      currentValue: updateDto.currentValue,
      updatedBy: updateDto.updatedBy,
      updateSource: updateDto.updateSource,
      metricMetadata: updateDto.metricMetadata || currentProgress.metricMetadata,
      comment: updateDto.comment,
      recordedAt: updateDto.recordedAt ? new Date(updateDto.recordedAt) : new Date(),
      version: currentProgress.version + 1,
      isLatest: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    newVersion.progressPercentage = this.calculateProgressPercentage(
      currentProgress.startingValue,
      updateDto.currentValue,
      currentProgress.targetValue,
    );

    newVersion.status = this.determineStatus(
      newVersion.progressPercentage,
      currentProgress.dueDate?.toISOString(),
      updateDto.currentValue,
      currentProgress.targetValue,
    );

    const saved = await this.progressRepository.save(newVersion);
    return this.mapToResponseDto(saved);
  }

  private calculateProgressPercentage(
    startingValue: number,
    currentValue: number,
    targetValue: number,
  ): number {
    if (targetValue === startingValue) {
      return currentValue >= targetValue ? 100 : 0;
    }

    const range = targetValue - startingValue;
    const progress = currentValue - startingValue;
    const percentage = (progress / range) * 100;

    return Math.min(Math.max(percentage, 0), 100); // Clamp between 0-100
  }

  private determineStatus(
    progressPercentage: number,
    dueDate: string | undefined,
    currentValue: number,
    targetValue: number,
  ): ProgressStatus {
    if (currentValue >= targetValue) {
      return ProgressStatus.COMPLETED;
    }

    if (!dueDate) {
      return progressPercentage >= 75 ? ProgressStatus.ON_TRACK : ProgressStatus.AT_RISK;
    }

    const due = new Date(dueDate);
    const now = new Date();
    const daysRemaining = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    // Expected progress based on time
    const totalDays = 90; // Assume 90-day cycle, should be configurable
    const daysPassed = totalDays - daysRemaining;
    const expectedProgress = (daysPassed / totalDays) * 100;

    const progressDelta = progressPercentage - expectedProgress;

    if (progressDelta >= -10) return ProgressStatus.ON_TRACK;
    if (progressDelta >= -25) return ProgressStatus.AT_RISK;
    return ProgressStatus.OFF_TRACK;
  }

  private isProgressOnTrack(
    currentProgress: number,
    dueDate: Date | undefined,
    estimatedCompletion: Date | undefined,
  ): boolean {
    if (currentProgress >= 100) return true;
    if (!dueDate || !estimatedCompletion) return currentProgress >= 75;
    return estimatedCompletion <= dueDate;
  }

  private mapToResponseDto(progress: KeyResultProgress): KeyResultProgressResponseDto {
    return {
      id: progress.id,
      keyResultId: progress.keyResultId,
      objectiveId: progress.objectiveId,
      keyResultName: progress.keyResultName,
      description: progress.description,
      metricType: progress.metricType,
      targetValue: Number(progress.targetValue),
      startingValue: Number(progress.startingValue),
      currentValue: Number(progress.currentValue),
      progressPercentage: Number(progress.progressPercentage),
      status: progress.status,
      updatedBy: progress.updatedBy,
      updateSource: progress.updateSource,
      metricMetadata: progress.metricMetadata,
      comment: progress.comment,
      recordedAt: progress.recordedAt,
      dueDate: progress.dueDate,
      confidenceScore: progress.confidenceScore,
      version: progress.version,
      isLatest: progress.isLatest,
      createdAt: progress.createdAt,
      updatedAt: progress.updatedAt,
      remainingValue: progress.remainingValue,
      isOverdue: progress.isOverdue,
      daysUntilDue: progress.daysUntilDue,
    };
  }
}
