import { ChainSlugs } from "../../../chains/libs/constants/chain-slugs.const";

export interface InitTokensResponse {
  saved: number;
  updated: number;
}

export type InitChainsTokensResponse = Partial<
  Record<ChainSlugs, InitTokensResponse>
>;
