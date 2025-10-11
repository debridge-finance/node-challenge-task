import { Module } from '@nestjs/common';
import { KafkaModule } from '../kafka/kafka.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from '../../models/token.entity'
import { TokenPriceUpdateService } from './token-price-update.service';
import { MockPriceService } from './mock-price.service';

@Module({
  imports: [
    KafkaModule,
    TypeOrmModule.forFeature([Token]),
  ],
  controllers: [],
  providers: [
    TokenPriceUpdateService,
    MockPriceService,
  ],
  exports: [
    TokenPriceUpdateService,
  ]
})
export class PriceModule {}
