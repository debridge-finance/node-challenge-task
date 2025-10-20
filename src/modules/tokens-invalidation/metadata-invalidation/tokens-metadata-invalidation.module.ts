import { Module } from "@nestjs/common";
import { CoingeckoPlatformsMetadataInvalidationModule } from "./sources/coingecko-platforms/coingecko-platforms-metadata-invalidation.module";
import { NativeTokensMetadataInvalidationModule } from "./sources/native-tokens/native-tokens-metadata-invalidation.module";

@Module({
  imports: [
    CoingeckoPlatformsMetadataInvalidationModule,
    NativeTokensMetadataInvalidationModule,
  ],
})
export class TokensMetadataInvalidationModule {}
