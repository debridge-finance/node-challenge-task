import { Module } from "@nestjs/common";
import { TokensMetadataInvalidationModule } from "./metadata-invalidation/tokens-metadata-invalidation.module";
import { TokensPricesInvalidationModule } from "./prices-invalidation/tokens-prices-invalidation.module";

@Module({
  imports: [TokensMetadataInvalidationModule, TokensPricesInvalidationModule],
})
export class TokensSourcesModule {}
