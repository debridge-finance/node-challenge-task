import { Module } from "@nestjs/common";
import { CoingeckoPlatformTokensService } from "./services/coingecko-platform-tokens.service";
import { InvalidateMetadataService } from "./services/invalidate-metadata.service";
import { TokensInvalidatorService } from "../../services/tokens-invalidator.service";
import { TokenMetadataInvalidatorService } from "../../services/token-metadata-invalidator.service";
import { TokenLogoInvalidatorService } from "../../services/token-logo-invalidator.service";
import { ChainsModule } from "../../../../chains/chains.module";
import { TokensMetadataModule } from "../../../../tokens-metadata/tokens-metadata.module";
import { ItemLogoModule } from "../../../../item-logo/item-logo.module";
import { TokensModule } from "../../../../tokens/tokens.module";
import { MetadataUpdateIntervalService } from "./services/metadata-update-interval.service";

@Module({
  imports: [ChainsModule, TokensMetadataModule, ItemLogoModule, TokensModule],
  providers: [
    CoingeckoPlatformTokensService,
    InvalidateMetadataService,
    TokensInvalidatorService,
    TokenMetadataInvalidatorService,
    TokenLogoInvalidatorService,
    MetadataUpdateIntervalService,
  ],
  exports: [InvalidateMetadataService, MetadataUpdateIntervalService],
})
export class CoingeckoPlatformsMetadataInvalidationModule {}
