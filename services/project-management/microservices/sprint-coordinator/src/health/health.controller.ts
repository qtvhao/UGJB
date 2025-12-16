/**
 * Associated Frontend Files:
 *   - web/app/src/lib/api.ts (internal health check, not directly exposed)
 */
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
      // Database health check
      () => this.db.pingCheck('database'),
      // Memory heap check (less than 150MB)
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      // Memory RSS check (less than 300MB)
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),
      // Disk storage check (less than 90% used)
      () =>
        this.disk.checkStorage('storage', {
          path: '/',
          thresholdPercent: 0.9,
        }),
    ]);
  }

  @Get('ready')
  @HealthCheck()
  ready() {
    return this.health.check([
      // Database connectivity check for readiness
      () => this.db.pingCheck('database'),
    ]);
  }

  @Get('live')
  live() {
    return {
      status: 'ok',
      service: 'sprint-coordinator',
      timestamp: new Date().toISOString(),
    };
  }
}
