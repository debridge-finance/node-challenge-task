import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ClientsModule } from '@nestjs/microservices';
import { Feed } from './models/feed.entity';
import { TokenBatchConsumer } from './token-batch.consumer';
import { TokenUpdateProducer } from './services/token-update.producer';
import { TokenProcessorService } from './services/token-processor.service';
import { MockPriceProvider } from './services/mock-price.provider';
import { getDatabaseConfig } from './config/database.config';
import { getKafkaConfig } from './config/kafka.config';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ClientsModule.registerAsync(getKafkaConfig()),
    TypeOrmModule.forRootAsync(getDatabaseConfig()),
    TypeOrmModule.forFeature([Feed]),
  ],
  controllers: [TokenBatchConsumer, HealthController],
  providers: [TokenUpdateProducer, TokenProcessorService, MockPriceProvider],
})
export class UpdaterModule {}
