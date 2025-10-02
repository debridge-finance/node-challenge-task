import { Module } from "@nestjs/common";
import { ChainModule } from "./chains/module";
import { PricesModule } from "./token-prices/module";
import { TokensModule } from "./tokens/module";

@Module({
  imports: [ChainModule, PricesModule, TokensModule],
})
export class CoreModule {}
