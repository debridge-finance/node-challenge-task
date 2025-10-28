import { Module } from '@nestjs/common';
import { TokenUpdatePricesScheduler } from './token-prices.scheduler';
import { TokenUpdatePricesService } from './token-prices.service';
import { PriceChangeNotifier, TokensPriceService } from './tokens';
import { KafkaProducerService } from '../../shared/kafka/kafka-producer.service';
import { MockPriceService } from '../../shared/prices/mock-price.service';

@Module({
  providers: [
    TokenUpdatePricesScheduler,
    TokenUpdatePricesService,
    {
      provide: TokensPriceService,
      useClass: MockPriceService,
    },
    {
      provide: PriceChangeNotifier,
      useClass: KafkaProducerService,
    },
  ],
})
export class TokenPricesModule {}
