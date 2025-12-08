import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KeyResultProgress } from './entities/key-result-progress.entity';
import { KeyResultService } from './key-result.service';
import { KeyResultController } from './key-result.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([KeyResultProgress]),

    BullModule.registerQueue(
      {
        name: 'key-result-metrics-update',
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: 100,
          removeOnFail: 50,
        },
      },
      {
        name: 'key-result-progress-calculation',
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: 100,
          removeOnFail: 50,
        },
      },
    ),
  ],
  controllers: [KeyResultController],
  providers: [KeyResultService],
  exports: [KeyResultService],
})
export class KeyResultModule {}
