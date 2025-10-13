import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Feed } from './models/feed.entity';
import { Consumer } from './services/consumer.controller';
import { ProducerService } from './services/producer.service';
import { TokenProcessorService } from './services/token-processor.service';
import { MockPriceProvider } from './services/mock-price.provider';

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
            clientId: `token-updater-service-${Math.random().toString(36).substring(2, 10)}-client`,
            brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
          },
          consumer: {
            groupId: 'token-updater-consumer-client',
            sessionTimeout: 45000,
            heartbeatInterval: 10000,
            rebalanceTimeout: 90000,
            allowAutoTopicCreation: process.env.KAFKA_CONSUMER_ALLOW_AUTO_TOPIC_CREATION === 'true',
          },
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
      entities: [Feed],
      migrations: [`${__dirname}/migrations/**/*{.ts,.js}`],
      migrationsRun: true,
      synchronize: true, // Set to true to automatically create tables
      ssl: false,
    }),
    TypeOrmModule.forFeature([Feed]),
  ],
  controllers: [Consumer],
  providers: [ProducerService, TokenProcessorService, MockPriceProvider],
})
export class UpdaterModule {}
