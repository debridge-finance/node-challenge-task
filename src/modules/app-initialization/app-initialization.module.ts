import { Module } from "@nestjs/common";
import { AppInitializationOrchestratorService } from "./services/app-initialization-orchestrator.service";
import { ChainsSeedModule } from "../chains-seed/chains-seed.module";
import { NativeTokensMetadataInvalidationModule } from "../tokens-invalidation/metadata-invalidation/sources/native-tokens/native-tokens-metadata-invalidation.module";
import { CoingeckoPlatformsMetadataInvalidationModule } from "../tokens-invalidation/metadata-invalidation/sources/coingecko-platforms/coingecko-platforms-metadata-invalidation.module";
import { MockPricesInvalidationModule } from "../tokens-invalidation/prices-invalidation/sources/mock/mock-prices-invalidation.module";

@Module({
  imports: [
    ChainsSeedModule,
    NativeTokensMetadataInvalidationModule,
    CoingeckoPlatformsMetadataInvalidationModule,
    MockPricesInvalidationModule,
  ],
  providers: [AppInitializationOrchestratorService],
  exports: [AppInitializationOrchestratorService],
})
export class AppInitializationModule {}
