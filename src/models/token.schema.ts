import { z } from 'zod';

// Zod schema for chain
export const chainSchema = z.object({
  id: z.string().uuid().optional(),
  deid: z.number(),
  name: z.string(),
  isEnabled: z.boolean().default(true),
});

// Zod schema for logo
export const logoSchema = z.object({
  id: z.string().uuid().optional(),
  tokenId: z.string().uuid().nullable().optional(),
  bigRelativePath: z.string(),
  smallRelativePath: z.string(),
  thumbRelativePath: z.string(),
});

// Zod schema for token validation
export const tokenSchema = z.object({
  id: z.string().uuid().optional(), // Optional for new tokens
  address: z.instanceof(Buffer),
  symbol: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  decimals: z.number().int().min(0).max(32767).default(0), // smallint range
  isNative: z.boolean().default(false),
  chainId: z.string().uuid(),
  isProtected: z.boolean().default(false),
  lastUpdateAuthor: z.string().nullable().optional(),
  priority: z.number().int().default(0),
  timestamp: z.date().default(() => new Date()),
  logoId: z.string().uuid().nullable().optional(),
  price: z.number().nonnegative().default(0),
  lastPriceUpdate: z.date().default(() => new Date())
});

// Type derived from the schemas
export type ChainData = z.infer<typeof chainSchema>;
export type LogoData = z.infer<typeof logoSchema>;
export type TokenData = z.infer<typeof tokenSchema>;

// Helper functions to validate data
export function validateChain(data: Partial<ChainData>): ChainData {
  return chainSchema.parse(data);
}

export function validateLogo(data: Partial<LogoData>): LogoData {
  return logoSchema.parse(data);
}

export function validateToken(data: Partial<TokenData>): TokenData {
  return tokenSchema.parse(data);
}

// Helper function to validate partial token data (for updates)
export function validatePartialToken(data: Partial<TokenData>): Partial<TokenData> {
  return tokenSchema.partial().parse(data);
}
