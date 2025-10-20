import {
  CHAIN_SLUGS,
  ChainSlugs,
} from "../../../../../../chains/libs/constants/chain-slugs.const";

export enum CoingeckoPlatformIDs {
  ETH = "ethereum",
  POL = "polygon-pos",
}

export const CHAIN_SLUGS_TO_COINGECKO_PLATFORMS: Partial<
  Record<ChainSlugs, CoingeckoPlatformIDs>
> = {
  [CHAIN_SLUGS.ETHEREUM]: CoingeckoPlatformIDs.ETH,
};

export const COINGECKO_PLATFORMS_TO_CHAIN_SLUGS: Partial<
  Record<CoingeckoPlatformIDs, ChainSlugs>
> = {
  [CoingeckoPlatformIDs.ETH]: CHAIN_SLUGS.ETHEREUM,
};
