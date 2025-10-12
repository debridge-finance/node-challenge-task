import { z } from 'zod';

// Zod schema for token validation
export const tokenSchema = z.object({
  id: z.string().uuid().optional(), // Optional for new tokens
  address: z.instanceof(Buffer),
  symbol: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  decimals: z.number().int().min(0).max(32767).default(0), // smallint range
  isNative: z.boolean().default(false),
  isProtected: z.boolean().default(false),
  lastUpdateAuthor: z.string().nullable().optional(),
  priority: z.number().int().default(0),
  timestamp: z.date().default(() => new Date()),

  // Denormalized chain data
  chainId: z.string().uuid(),
  chainName: z.string(),
  chainIsEnabled: z.boolean().default(true),

  // Denormalized logo data
  logoId: z.string().uuid(),
  logoTokenId: z.string().uuid().nullable().optional(),
  logoBigRelativePath: z.string(),
  logoSmallRelativePath: z.string(),
  logoThumbRelativePath: z.string(),

  price: z.number().nonnegative().default(0),
  lastPriceUpdate: z.date().default(() => new Date()),
});
// Type derived from the schema
export type TokenData = z.infer<typeof tokenSchema>;

// Helper function to validate token data
export function validateToken(data: Partial<TokenData>): TokenData {
  return tokenSchema.parse(data);
}

// Helper function to validate partial token data (for updates)
export function validatePartialToken(data: Partial<TokenData>): Partial<TokenData> {
  return tokenSchema.partial().parse(data);
}
