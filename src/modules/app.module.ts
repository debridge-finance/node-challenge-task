import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PostgresModule } from "./postgres/postgres.module";
import { ChainsModule } from "./chains/chains.module";
import { TokensModule } from "./tokens/tokens.module";
import { TokenPricesModule } from "./token-prices/token-prices.module";
import { TokensMetadataModule } from "./tokens-metadata/tokens-metadata.module";
import { ItemLogoModule } from "./item-logo/item-logo.module";
import { TokensSourcesModule } from "./tokens-invalidation/tokens-sources.module";
import { AppEnvsSchema } from "../config/app-envs.schema";
import { ChainsSeedModule } from "./chains-seed/chains-seed.module";
import { AppInitializationModule } from "./app-initialization/app-initialization.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => {
        return AppEnvsSchema.parse(config);
      },
    }),
    PostgresModule,
    ChainsModule,
    TokensModule,
    TokenPricesModule,
    TokensMetadataModule,
    ItemLogoModule,
    ChainsSeedModule,
    TokensSourcesModule,
    AppInitializationModule,
  ],
})
export class AppModule {}
