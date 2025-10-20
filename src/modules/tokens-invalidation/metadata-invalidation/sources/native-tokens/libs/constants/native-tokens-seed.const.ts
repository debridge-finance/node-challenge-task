import { UniversalInvalidatingTokenMetadata } from "../../../../../../../common/libs/types/universal-token.types";
import {
  CHAIN_SLUGS,
  ChainSlugs,
} from "../../../../../../chains/libs/constants/chain-slugs.const";

export const NATIVE_TOKENS_SEED: Record<
  ChainSlugs,
  UniversalInvalidatingTokenMetadata
> = {
  [CHAIN_SLUGS.BITCOIN]: {
    symbol: "BTC",
    name: "Bitcoin",
    decimals: 8,
    address: "0x0",
    logo: {
      bigPath: null,
      smallPath: null,
      thumbPath: null,
    },
  },
  [CHAIN_SLUGS.ETHEREUM]: {
    symbol: "ETH",
    name: "Ethereum",
    decimals: 18,
    address: "0x0",
    logo: {
      bigPath: null,
      smallPath: null,
      thumbPath: null,
    },
  },
  [CHAIN_SLUGS.SOLANA]: {
    symbol: "SOL",
    name: "Solana",
    decimals: 9,
    address: "0x0",
    logo: {
      bigPath: null,
      smallPath: null,
      thumbPath: null,
    },
  },
};
