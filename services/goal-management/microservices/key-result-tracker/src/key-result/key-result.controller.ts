/**
 * Associated Frontend Files:
 *   - web/app/src/lib/api.ts (goalsApi.keyResults - lines 111-113)
 *   - web/app/src/pages/Dashboard.tsx
 */
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { KeyResultService } from './key-result.service';
import {
  CreateKeyResultProgressDto,
  UpdateKeyResultProgressDto,
  MetricUpdateWebhookDto,
  ProgressQueryDto,
  KeyResultProgressResponseDto,
  ProgressSummaryDto,
  BulkMetricUpdateDto,
} from './dto/key-result.dto';

@Controller('key-results')
export class KeyResultController {
  private readonly logger = new Logger(KeyResultController.name);

  constructor(private readonly keyResultService: KeyResultService) {}

  /**
   * Create a new progress record
   * POST /api/v1/key-results/progress
   */
  @Post('progress')
  @HttpCode(HttpStatus.CREATED)
  async createProgress(
    @Body() createDto: CreateKeyResultProgressDto,
  ): Promise<KeyResultProgressResponseDto> {
    this.logger.log(`POST /key-results/progress - Creating progress for ${createDto.keyResultId}`);
    return this.keyResultService.createProgress(createDto);
  }

  /**
   * Get progress records with filtering
   * GET /api/v1/key-results/progress
   */
  @Get('progress')
  @HttpCode(HttpStatus.OK)
  async getProgress(@Query() query: ProgressQueryDto): Promise<{
    data: KeyResultProgressResponseDto[];
    total: number;
    limit: number;
    offset: number;
  }> {
    this.logger.log(`GET /key-results/progress - Query: ${JSON.stringify(query)}`);
    return this.keyResultService.getProgress(query);
  }

  /**
   * Get specific progress record by ID
   * GET /api/v1/key-results/progress/:id
   */
  @Get('progress/:id')
  @HttpCode(HttpStatus.OK)
  async getProgressById(@Param('id') id: string): Promise<KeyResultProgressResponseDto> {
    this.logger.log(`GET /key-results/progress/${id}`);
    return this.keyResultService.getProgressById(id);
  }

  /**
   * Update progress record
   * PUT /api/v1/key-results/progress/:id
   */
  @Put('progress/:id')
  @HttpCode(HttpStatus.OK)
  async updateProgress(
    @Param('id') id: string,
    @Body() updateDto: UpdateKeyResultProgressDto,
  ): Promise<KeyResultProgressResponseDto> {
    this.logger.log(`PUT /key-results/progress/${id}`);
    return this.keyResultService.updateProgress(id, updateDto);
  }

  /**
   * Delete progress record (soft delete)
   * DELETE /api/v1/key-results/progress/:id
   */
  @Delete('progress/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProgress(@Param('id') id: string): Promise<void> {
    this.logger.log(`DELETE /key-results/progress/${id}`);
    return this.keyResultService.deleteProgress(id);
  }

  /**
   * Get latest progress for a key result
   * GET /api/v1/key-results/:keyResultId/latest
   */
  @Get(':keyResultId/latest')
  @HttpCode(HttpStatus.OK)
  async getLatestProgress(
    @Param('keyResultId') keyResultId: string,
  ): Promise<KeyResultProgressResponseDto> {
    this.logger.log(`GET /key-results/${keyResultId}/latest`);
    return this.keyResultService.getLatestProgress(keyResultId);
  }

  /**
   * Get progress summary for a key result
   * GET /api/v1/key-results/:keyResultId/summary
   */
  @Get(':keyResultId/summary')
  @HttpCode(HttpStatus.OK)
  async getProgressSummary(
    @Param('keyResultId') keyResultId: string,
  ): Promise<ProgressSummaryDto> {
    this.logger.log(`GET /key-results/${keyResultId}/summary`);
    return this.keyResultService.getProgressSummary(keyResultId);
  }

  /**
   * Webhook endpoint for metric updates
   * POST /api/v1/key-results/webhook/metric-update
   */
  @Post('webhook/metric-update')
  @HttpCode(HttpStatus.OK)
  async handleMetricWebhook(
    @Body() webhookDto: MetricUpdateWebhookDto,
  ): Promise<KeyResultProgressResponseDto> {
    this.logger.log(`POST /key-results/webhook/metric-update - ${webhookDto.keyResultId}`);
    return this.keyResultService.handleMetricWebhook(webhookDto);
  }

  /**
   * Bulk webhook endpoint for multiple metric updates
   * POST /api/v1/key-results/webhook/bulk-metric-update
   */
  @Post('webhook/bulk-metric-update')
  @HttpCode(HttpStatus.OK)
  async handleBulkMetricWebhook(
    @Body() bulkDto: BulkMetricUpdateDto,
  ): Promise<{ processed: number; failed: number; results: any[] }> {
    this.logger.log(
      `POST /key-results/webhook/bulk-metric-update - ${bulkDto.updates.length} updates`,
    );
    return this.keyResultService.handleBulkMetricWebhook(bulkDto);
  }

  /**
   * Health check for webhook endpoint
   * GET /api/v1/key-results/webhook/health
   */
  @Get('webhook/health')
  @HttpCode(HttpStatus.OK)
  async webhookHealthCheck(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }
}
