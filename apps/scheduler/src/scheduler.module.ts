import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ClientsModule } from '@nestjs/microservices';
import { SchedulerService } from './services/scheduler.service';
import { Token } from './models/token.entity';
import { TokenSeeder } from './services/token.seeder';
import { BatchProducerService } from './services/batch-producer.service';
import { PriceUpdateConsumer } from './services/price-update-consumer.controller';
import { getDatabaseConfig } from './config/database.config';
import { getKafkaConfig } from './config/kafka.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    ClientsModule.registerAsync(getKafkaConfig()),
    TypeOrmModule.forRootAsync(getDatabaseConfig()),
    TypeOrmModule.forFeature([Token]),
  ],
  controllers: [PriceUpdateConsumer],
  providers: [SchedulerService, TokenSeeder, BatchProducerService],
})
export class SchedulerModule implements OnModuleInit {
  constructor(
    private readonly tokenSeeder: TokenSeeder,
    private readonly scheduler: SchedulerService,
  ) {}

  async onModuleInit() {
    try {
      await this.tokenSeeder.seed();
      await this.scheduler.handleCron();
    } catch (error) {
      console.error('Failed to initialize application:', error);
    }
  }
}
