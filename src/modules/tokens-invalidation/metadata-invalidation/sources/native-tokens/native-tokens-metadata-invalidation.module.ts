import { Module } from "@nestjs/common";
import { NativeTokensSeederService } from "./services/native-tokens-seeder.service";
import { ChainsModule } from "../../../../chains/chains.module";
import { TokensModule } from "../../../../tokens/tokens.module";
import { TokensMetadataModule } from "../../../../tokens-metadata/tokens-metadata.module";
import { ItemLogoModule } from "../../../../item-logo/item-logo.module";

@Module({
  imports: [ChainsModule, TokensModule, TokensMetadataModule, ItemLogoModule],
  providers: [NativeTokensSeederService],
  exports: [NativeTokensSeederService],
})
export class NativeTokensMetadataInvalidationModule {}
