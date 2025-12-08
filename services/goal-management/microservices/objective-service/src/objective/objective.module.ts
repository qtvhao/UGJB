import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObjectiveController } from './objective.controller';
import { ObjectiveService } from './objective.service';
import { Objective } from './entities/objective.entity';
import { KeyResult } from './entities/key-result.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Objective, KeyResult])],
  controllers: [ObjectiveController],
  providers: [ObjectiveService],
  exports: [ObjectiveService],
})
export class ObjectiveModule {}
