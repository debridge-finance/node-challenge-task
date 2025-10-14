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
import { getSchedulerConfig } from './config/scheduler.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [getSchedulerConfig] }),
    ScheduleModule.forRoot(),
    ClientsModule.registerAsync(getKafkaConfig()),
    TypeOrmModule.forRootAsync(getDatabaseConfig()),
    TypeOrmModule.forFeature([Token, Chain, Logo]),
  ],
  controllers: [PriceUpdateConsumer],
  providers: [SchedulerService, TokenSeeder, TokenBatchProducer],
})
export class SchedulerModule {}
