import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from '../models/token.entity';
import { TokenPriceUpdateService } from './token-price-update.service';
import { MockPriceService } from './mock-price.service';
import { KafkaProducerModule } from '../kafka/kafka-producer.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Token]),
    KafkaProducerModule,
  ],
  providers: [TokenPriceUpdateService, MockPriceService],
  exports: [TokenPriceUpdateService, MockPriceService],
})
export class TokenPriceUpdateModule {}