export interface UniversalInvalidatingTokenMetadata {
  symbol: string;
  name: string;
  decimals: number;
  address: string;
  logo: {
    bigPath: string | null;
    smallPath: string | null;
    thumbPath: string | null;
  };
}
