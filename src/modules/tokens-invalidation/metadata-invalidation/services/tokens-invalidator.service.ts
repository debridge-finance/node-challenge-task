import { Injectable, Logger } from "@nestjs/common";
import { ChainRepository } from "../../../chains/repository/chain.repository";
import { InitTokensResponse } from "../../libs/types/init-response.types";
import { UniversalInvalidatingTokenMetadata } from "../../../../common/libs/types/universal-token.types";
import { TokenMetadata } from "../../../tokens-metadata/entities/token-metadata.entity";
import { ItemLogo } from "../../../item-logo/entities/item-logo.entity";
import { Chain } from "../../../chains/entities/chain.entity";
import { TokenMetaPlaceholderService } from "../../../tokens-metadata/services/token-meta-placeholder.service";
import { LogoPlaceholderService } from "../../../item-logo/services/logo-placeholder.service";
import { TokenRepository } from "../../../tokens/repository/token.repository";
import { Token } from "../../../tokens/entities/token.entity";
import { TokenMetadataInvalidatorService } from "./token-metadata-invalidator.service";
import { buildNameSymbolKey } from "../../libs/helpers/build-name-symbol-key.helper";
import { validateDeBridgeTokenMeta } from "../../libs/helpers/validate-token-meta.helper";
import { ChainSlugs } from "../../../chains/libs/constants/chain-slugs.const";
import { TokenLogoInvalidatorService } from "./token-logo-invalidator.service";
import { UNKNOWN_TOKEN_METADATA } from "../../../../common/libs/constants/unknown-items.const";

@Injectable()
export class TokensInvalidatorService {
  private readonly logger = new Logger(TokensInvalidatorService.name);

  constructor(
    private readonly chainRepository: ChainRepository,
    private readonly tokenMetaPlaceholderService: TokenMetaPlaceholderService,
    private readonly logoPlaceholderService: LogoPlaceholderService,
    private readonly tokenRepository: TokenRepository,
    private readonly tokenMetadataInvalidatorService: TokenMetadataInvalidatorService,
    private readonly tokenLogoInvalidatorService: TokenLogoInvalidatorService
  ) {}

  async invalidateTokensByChain(
    tokens: UniversalInvalidatingTokenMetadata[],
    chainSlug: ChainSlugs
  ): Promise<InitTokensResponse> {
    const counts: InitTokensResponse = {
      saved: 0,
      updated: 0,
    };

    const foundChain = await this.chainRepository.findByChainSlug(chainSlug);
    if (!foundChain) {
      return counts;
    }

    this.logger.log(`[CHAIN_SLUG: ${chainSlug}] Finished fetching tokens`);

    const batchSize = 500;
    const totalTokens = tokens.length;
    const pages = Math.ceil(totalTokens / batchSize);

    this.logger.log(
      `[CHAIN_SLUG: ${chainSlug}] Batch handling ${pages} pages (with ${batchSize} tokens per page) of total ${totalTokens} tokens`
    );

    const placeholderLogo = await this.logoPlaceholderService.getOrCreate();
    const placeholderMetadata =
      await this.tokenMetaPlaceholderService.getOrCreate();

    for (let pageNum = 0; pageNum < pages; pageNum++) {
      const offset = pageNum * batchSize;
      const offsetLimit =
        pageNum === pages - 1 ? totalTokens : (pageNum + 1) * batchSize;
      const page: UniversalInvalidatingTokenMetadata[] = [];

      for (let i = offset; i < offsetLimit; i++) {
        page.push(tokens[i]);
      }

      this.logger.log(
        `[CHAIN_SLUG: ${chainSlug}] Tokens init from: ${offset} - ${offsetLimit}, total: ${totalTokens}`
      );

      const processedCount = await this.processBatch(
        page,
        foundChain,
        placeholderLogo,
        placeholderMetadata
      );

      counts.saved += processedCount.saved;
      counts.updated += processedCount.updated;
    }

    this.logger.log(
      `[CHAIN_SLUG: ${chainSlug}] Finished loading ${counts.saved} tokens`
    );

    return counts;
  }

  private async processBatch(
    tokens: UniversalInvalidatingTokenMetadata[],
    chain: Chain,
    placeholderLogo: ItemLogo,
    placeholderMetadata: TokenMetadata
  ): Promise<InitTokensResponse> {
    const counts: InitTokensResponse = {
      saved: 0,
      updated: 0,
    };

    if (!tokens.length) {
      return counts;
    }

    const addresses: string[] = tokens.map((t) => t.address.toLowerCase());

    const existingTokens = await this.tokenRepository.findByAddressesAndChain(
      addresses,
      chain.id
    );

    const existingTokenMap: Map<string, Token> = new Map(
      existingTokens.map((t) => [t.address.toLowerCase(), t])
    );

    const metadataMap = await this.tokenMetadataInvalidatorService.invalidate(
      tokens
    );
    const logoMap = await this.tokenLogoInvalidatorService.invalidate(
      tokens,
      placeholderLogo
    );

    const tokensToInsert: Token[] = [];
    const tokensToUpdate: Token[] = [];

    for (const token of tokens) {
      const address = token.address.toLowerCase();
      const existingToken = existingTokenMap.get(address);

      const validatedToken = validateDeBridgeTokenMeta(token);
      const metadataKey = buildNameSymbolKey(
        validatedToken.name,
        validatedToken.symbol
      );
      const metadata = metadataMap.get(metadataKey) || placeholderMetadata;

      const logo =
        logoMap.get(token.logo.bigPath || UNKNOWN_TOKEN_METADATA.logo) ||
        placeholderLogo;

      if (!existingToken) {
        const tokenTemplate = this.tokenRepository.create({
          address,
          decimals: token.decimals,
          is_native: false,
          is_protected: false,
          priority: 0,
          chain,
          token_metadata: metadata,
          logo,
        });

        tokensToInsert.push(tokenTemplate);
      } else {
        let needsUpdate = false;

        if (
          existingToken.token_metadata.symbol ===
            UNKNOWN_TOKEN_METADATA.symbol &&
          existingToken.token_metadata.name === UNKNOWN_TOKEN_METADATA.name &&
          validatedToken.isValid
        ) {
          existingToken.token_metadata = metadata;
          needsUpdate = true;
        }

        if (
          existingToken.logo.big_relative_path.includes(
            UNKNOWN_TOKEN_METADATA.logo
          ) &&
          token.logo.bigPath
        ) {
          existingToken.logo = logo;
          needsUpdate = true;
        }

        if (needsUpdate) {
          tokensToUpdate.push(existingToken);
        }
      }
    }

    if (tokensToInsert.length) {
      try {
        await this.tokenRepository.bulkInsert(tokensToInsert);
        counts.saved = tokensToInsert.length;
      } catch (error) {
        this.logger.error(
          `[CHAIN_SLUG: ${chain.slug}] Error inserting tokens: ${error.message}`,
          error.stack
        );
      }
    }

    if (tokensToUpdate.length) {
      try {
        await this.tokenRepository.save(tokensToUpdate);
        counts.updated = tokensToUpdate.length;
      } catch (error) {
        this.logger.error(
          `[CHAIN_SLUG: ${chain.slug}] Error updating tokens: ${error.message}`,
          error.stack
        );
      }
    }

    this.logger.log(
      `[CHAIN_SLUG: ${chain.slug}] Processed batch: ${counts.saved} new tokens, ${tokensToUpdate.length} updated`
    );

    return counts;
  }
}
