import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ClientsModule } from '@nestjs/microservices';
import { SchedulerService } from './services/scheduler.service';
import { Token } from './models/token.entity';
import { Chain } from './models/chain.entity';
import { Logo } from './models/logo.entity';
import { TokenSeeder } from './services/token.seeder';
import { TokenBatchProducer } from './services/token-batch.producer';
import { PriceUpdateConsumer } from './price-update.consumer';
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
    TypeOrmModule.forFeature([Token, Chain, Logo]),
  ],
  controllers: [PriceUpdateConsumer],
  providers: [SchedulerService, TokenSeeder, TokenBatchProducer],
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
