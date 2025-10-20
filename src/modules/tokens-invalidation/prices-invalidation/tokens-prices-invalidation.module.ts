import { Module } from "@nestjs/common";
import { MockPricesInvalidationModule } from "./sources/mock/mock-prices-invalidation.module";

@Module({
  imports: [MockPricesInvalidationModule],
})
export class TokensPricesInvalidationModule {}
