// Different blockchains can have different identifiers
// e.g. for the Ethereum mainnet, the chain ID is 1
// To avoid conflicts unique identifiers (slug names) are presented here
// All tokens sources should follow this convention, and implement
// adapters (mappings) if needed from source chain to our system chain slug
export const CHAIN_SLUGS = {
  BITCOIN: "btc",
  ETHEREUM: "eth",
  SOLANA: "sol",
} as const;

export type ChainSlugs = (typeof CHAIN_SLUGS)[keyof typeof CHAIN_SLUGS];
