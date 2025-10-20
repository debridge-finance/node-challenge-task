import { Injectable } from "@nestjs/common";
import { CoingeckoPlatformTokensService } from "./coingecko-platform-tokens.service";
import { UniversalInvalidatingTokenMetadata } from "../../../../../../common/libs/types/universal-token.types";
import { TokensInvalidatorService } from "../../../services/tokens-invalidator.service";
import {
  InitChainsTokensResponse,
  InitTokensResponse,
} from "../../../../libs/types/init-response.types";
import {
  CHAIN_SLUGS,
  ChainSlugs,
} from "../../../../../chains/libs/constants/chain-slugs.const";
import { removeAllQuotes } from "../../../../../../common/libs/utils/remove-quotes-from-string.util";

@Injectable()
export class InvalidateMetadataService {
  constructor(
    private readonly coingeckoPlatformTokensService: CoingeckoPlatformTokensService,
    private readonly tokensInvalidatorService: TokensInvalidatorService
  ) {}

  async invalidateAll(): Promise<InitChainsTokensResponse> {
    const supportedChainSlugs = Object.values(CHAIN_SLUGS);

    let counts: InitChainsTokensResponse = {};
    for (const slug of supportedChainSlugs) {
      counts[slug] = await this.invalidateByChainSlug(slug);
    }

    return counts;
  }

  async invalidateByChainSlug(
    chainSlug: ChainSlugs
  ): Promise<InitTokensResponse> {
    let count: InitTokensResponse = {
      saved: 0,
      updated: 0,
    };

    const coingeckoTokens =
      await this.coingeckoPlatformTokensService.getTokensListByChainSlug(
        chainSlug
      );

    if (!coingeckoTokens?.tokens) {
      return count;
    }

    const universalTokens: UniversalInvalidatingTokenMetadata[] =
      coingeckoTokens.tokens.map((token) => ({
        address: token.address,
        name: removeAllQuotes(token.name),
        symbol: removeAllQuotes(token.symbol),
        decimals: token.decimals,
        logo: {
          bigPath: token.logoURI,
          smallPath: token.logoURI,
          thumbPath: token.logoURI,
        },
      }));

    const resp = await this.tokensInvalidatorService.invalidateTokensByChain(
      universalTokens,
      chainSlug
    );

    count.saved = resp.saved;

    return count;
  }
}
