import {
  CHAIN_SLUGS,
  ChainSlugs,
} from "../../../chains/libs/constants/chain-slugs.const";

interface ChainMeta {
  blockchain_id: number | null;
  name: string;
  slug: ChainSlugs;
}

export const CHAINS_SEED: Record<ChainSlugs, ChainMeta> = {
  [CHAIN_SLUGS.BITCOIN]: {
    blockchain_id: null,
    name: "Bitcoin",
    slug: CHAIN_SLUGS.BITCOIN,
  },
  [CHAIN_SLUGS.ETHEREUM]: {
    blockchain_id: 1,
    name: "Ethereum",
    slug: CHAIN_SLUGS.ETHEREUM,
  },
  [CHAIN_SLUGS.SOLANA]: {
    blockchain_id: null,
    name: "Solana",
    slug: CHAIN_SLUGS.SOLANA,
  },
};
