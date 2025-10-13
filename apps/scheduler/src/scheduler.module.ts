import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SchedulerService } from './services/scheduler.service';
import { Token } from './models/token.entity';
import { TokenSeeder } from './services/token.seeder';
import { BatchProducerService } from './services/batch-producer.service';
import { PriceUpdateConsumer } from './services/price-update-consumer.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    ClientsModule.register([
      {
        name: 'TOKEN_BATCH_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'token-scheduler-service',
            brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
          },
          producer: { allowAutoTopicCreation: true },
        },
      },
    ]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USERNAME || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: process.env.DATABASE_NAME || 'tokens',
      entities: [Token],
      migrations: [`${__dirname}/migrations/**/*{.ts,.js}`],
      migrationsRun: true,
      synchronize: false,
      ssl: false,
    }),
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
