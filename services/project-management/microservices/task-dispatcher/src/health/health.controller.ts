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
      () => this.db.pingCheck('database', { timeout: 3000 }),

      // Memory heap check (should not exceed 300MB)
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),

      // Memory RSS check (should not exceed 300MB)
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),

      // Disk storage check (should have at least 50% free space)
      () =>
        this.disk.checkStorage('disk_health', {
          path: '/',
          thresholdPercent: 0.5,
        }),
    ]);
  }

  @Get('live')
  @HealthCheck()
  live() {
    return this.health.check([
      // Simple liveness check
      () => Promise.resolve({ live: { status: 'up' } }),
    ]);
  }

  @Get('ready')
  @HealthCheck()
  ready() {
    return this.health.check([
      // Database readiness check
      () => this.db.pingCheck('database', { timeout: 3000 }),
    ]);
  }
}
