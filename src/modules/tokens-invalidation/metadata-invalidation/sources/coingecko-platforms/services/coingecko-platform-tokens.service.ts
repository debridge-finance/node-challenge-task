import { Injectable, Logger } from "@nestjs/common";
import { ChainSlugs } from "../../../../../chains/libs/constants/chain-slugs.const";
import { CHAIN_SLUGS_TO_COINGECKO_PLATFORMS } from "../libs/constants/coingecko-to-slug.const";
import { CoingeckoTokens } from "../libs/types/coingecko-tokens.types";
import { retry } from "../../../../../../common/libs/helpers/retry.helper";

@Injectable()
export class CoingeckoPlatformTokensService {
  private readonly logger = new Logger(CoingeckoPlatformTokensService.name);

  async getTokensListByChainSlug(
    chainSlug: ChainSlugs
  ): Promise<CoingeckoTokens | null> {
    const coingeckoPlatformId = CHAIN_SLUGS_TO_COINGECKO_PLATFORMS[chainSlug];
    if (!coingeckoPlatformId) {
      return null;
    }
    try {
      const { promise } = retry(
        () =>
          fetch(`https://tokens.coingecko.com/${coingeckoPlatformId}/all.json`),
        {
          n: Infinity,
          minWait: 30000,
          maxWait: 60000,
        }
      );

      const response = await promise;

      return (await response.json()) as CoingeckoTokens;
    } catch (err: any) {
      this.logger.error(
        `[COINGECKO] Get tokens list error: ${err.message}`,
        err.stack
      );
    }

    return null;
  }
}
