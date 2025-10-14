import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ClientsModule } from '@nestjs/microservices';
import { Feed } from './models/feed.entity';
import { Consumer } from './services/consumer.controller';
import { ProducerService } from './services/producer.service';
import { TokenProcessorService } from './services/token-processor.service';
import { MockPriceProvider } from './services/mock-price.provider';
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
    TypeOrmModule.forFeature([Feed]),
  ],
  controllers: [Consumer],
  providers: [ProducerService, TokenProcessorService, MockPriceProvider],
})
export class UpdaterModule {}
