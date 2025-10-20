import { Injectable, Logger } from "@nestjs/common";
import { ChainRepository } from "../../../../../chains/repository/chain.repository";
import { TokenRepository } from "../../../../../tokens/repository/token.repository";
import { TokenMetadataRepository } from "../../../../../tokens-metadata/repository/token-metadata.repository";
import { ItemLogoRepository } from "../../../../../item-logo/repository/item-logo.repository";
import { LogoPlaceholderService } from "../../../../../item-logo/services/logo-placeholder.service";
import { NATIVE_TOKENS_SEED } from "../libs/constants/native-tokens-seed.const";
import { ChainSlugs } from "../../../../../chains/libs/constants/chain-slugs.const";

@Injectable()
export class NativeTokensSeederService {
  private readonly logger = new Logger(NativeTokensSeederService.name);

  constructor(
    private readonly chainRepository: ChainRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly tokenMetadataRepository: TokenMetadataRepository,
    private readonly itemLogoRepository: ItemLogoRepository,
    private readonly logoPlaceholderService: LogoPlaceholderService
  ) {}

  async seedNativeTokens(): Promise<void> {
    this.logger.log("Starting native tokens seeding...");

    for (const [slug, tokenData] of Object.entries(NATIVE_TOKENS_SEED)) {
      const chain = await this.chainRepository.findByChainSlug(
        slug as ChainSlugs
      );

      if (!chain) {
        this.logger.warn(
          `Chain ${slug} not found, skipping native token seeding...`
        );
        continue;
      }

      const existingTokens = await this.tokenRepository.findByAddressesAndChain(
        [tokenData.address],
        chain.id
      );

      if (existingTokens.length) {
        this.logger.log(
          `Native token for ${chain.name} (${slug}) already exists, skipping...`
        );
        continue;
      }

      let tokenMetadata = await this.tokenMetadataRepository.findOne({
        name: tokenData.name,
        symbol: tokenData.symbol,
      });

      if (!tokenMetadata) {
        tokenMetadata = this.tokenMetadataRepository.create({
          name: tokenData.name,
          symbol: tokenData.symbol,
        });
        tokenMetadata = await this.tokenMetadataRepository.save(tokenMetadata);
        this.logger.log(
          `Created token metadata for ${tokenData.name} (${tokenData.symbol})`
        );
      }

      let logo;
      if (tokenData.logo.bigPath) {
        logo = await this.itemLogoRepository.findOne({
          big_relative_path: tokenData.logo.bigPath,
        });

        if (!logo) {
          logo = this.itemLogoRepository.create({
            big_relative_path: tokenData.logo.bigPath,
            small_relative_path: tokenData.logo.smallPath!,
            thumb_relative_path: tokenData.logo.thumbPath!,
          });
          logo = await this.itemLogoRepository.save(logo);
          this.logger.log(`Created logo for ${tokenData.name}`);
        }
      } else {
        logo = await this.logoPlaceholderService.getOrCreate();
        this.logger.log(
          `Using placeholder logo for ${tokenData.name} (${tokenData.symbol})`
        );
      }

      // Create native token
      const nativeToken = this.tokenRepository.create({
        address: tokenData.address,
        decimals: tokenData.decimals,
        is_native: true,
        is_protected: true,
        priority: 100,
        chain,
        token_metadata: tokenMetadata,
        logo,
      });

      await this.tokenRepository.save(nativeToken);
      this.logger.log(
        `Native token ${tokenData.name} (${tokenData.symbol}) for ${chain.name} seeded successfully`
      );
    }

    this.logger.log("Native tokens seeding completed");
  }
}
