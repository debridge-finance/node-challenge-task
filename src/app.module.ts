import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Token } from './models/token.entity';
import { TokenPriceUpdateService } from './services/token-price-update.service';
import { MockPriceProvider } from './services/mock-price.provider';
import { ProducerService } from './services/producer.service';
import { SchedulerService } from './services/scheduler.service';
import { HealthController } from './health.controller';
import { TokenSeeder } from './services/token.seeder';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    ClientsModule.register([
      {
        name: 'TOKEN_PRICE_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'token-price-service',
            brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
          },
          consumer: { groupId: 'token-price-consumer' },
          producer: { allowAutoTopicCreation: true },
          subscribe: {
            fromBeginning: true,
          },
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
      migrations: [__dirname + '/migrations/*.{js,ts}'],
      migrationsRun: true, // Run migrations automatically
      synchronize: false, // Disabled when using migrations
      ssl: false,
    }),
    TypeOrmModule.forFeature([Token]),
  ],
  controllers: [HealthController],
  providers: [
    TokenPriceUpdateService,
    MockPriceProvider,
    ProducerService,
    TokenSeeder,
    SchedulerService,
  ],
})
export class AppModule implements OnModuleInit {
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
