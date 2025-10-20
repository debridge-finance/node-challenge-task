import { Module } from "@nestjs/common";
import { KafkaModule } from "../../../../kafka/kafka.module";
import { TokensModule } from "../../../../tokens/tokens.module";
import { TokenPricesModule } from "../../../../token-prices/token-prices.module";
import { TokenPriceKafkaService } from "../../services/token-price-kafka.service";
import { TokenPriceInvalidationService } from "./services/token-price-invalidation.service";
import { PriceUpdateIntervalService } from "./services/price-update-interval.service";
import { MockPriceService } from "./services/mock-price.service";

@Module({
  imports: [KafkaModule, TokensModule, TokenPricesModule],
  providers: [
    MockPriceService,
    TokenPriceKafkaService,
    TokenPriceInvalidationService,
    PriceUpdateIntervalService,
  ],
  exports: [TokenPriceInvalidationService, PriceUpdateIntervalService],
})
export class MockPricesInvalidationModule {}
