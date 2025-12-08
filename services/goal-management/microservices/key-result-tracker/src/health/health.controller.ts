import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Database health
      () => this.db.pingCheck('database'),

      // Memory health - heap should not exceed 300MB
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),

      // Memory health - RSS should not exceed 500MB
      () => this.memory.checkRSS('memory_rss', 500 * 1024 * 1024),

      // Disk health - disk should have at least 10% free space
      () =>
        this.disk.checkStorage('disk', {
          path: '/',
          thresholdPercent: 0.9,
        }),
    ]);
  }

  @Get('ready')
  @HealthCheck()
  ready() {
    return this.health.check([
      // Check if database is ready
      () => this.db.pingCheck('database'),
    ]);
  }

  @Get('live')
  live() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'key-result-tracker',
    };
  }
}
