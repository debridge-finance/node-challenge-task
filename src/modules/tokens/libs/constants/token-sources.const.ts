export const TOKENS_SOURCES = {
  COINGECKO: "coingecko",
  SEED: "seed",
} as const;

export type TokensSources =
  (typeof TOKENS_SOURCES)[keyof typeof TOKENS_SOURCES];
