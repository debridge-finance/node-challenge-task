import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { SchedulerService } from './token-batch.scheduler';
import { TokenBatchProducer } from './token-batch.producer';
import { TokenBatchService } from './token-batch.service';
import { getKafkaConfig } from '../../config/kafka.config';
import { getSchedulerConfig } from '../../config/scheduler.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from '../../models/token.entity';

@Module({
  imports: [
    ConfigModule.forFeature(getSchedulerConfig),
    ClientsModule.registerAsync(getKafkaConfig()),
    TypeOrmModule.forFeature([Token]),
  ],
  providers: [SchedulerService, TokenBatchProducer, TokenBatchService],
})
export class TokenBatchModule {}
