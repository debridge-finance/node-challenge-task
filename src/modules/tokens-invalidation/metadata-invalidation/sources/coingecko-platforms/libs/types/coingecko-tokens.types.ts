export interface CoingeckoToken {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
}

export interface CoingeckoTokens {
  name: string;
  logoURI: string;
  keywords: string[];
  timestamp: Date;
  tokens: CoingeckoToken[];
}
