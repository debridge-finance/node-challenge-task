import { z } from "zod";

// Zod schema for token validation
export const tokenSchema = z.object({
  id: z.string().uuid().optional(), // Optional for new tokens
  address: z.instanceof(Buffer),
  symbol: z.string().optional(),
  name: z.string().optional(),
  decimals: z.number().int().min(0).max(32767).default(0), // smallint range
  isNative: z.boolean().default(false),
  chainId: z.string().uuid(),
  isProtected: z.boolean().default(false),
  lastUpdateAuthor: z.string().optional(),
  priority: z.number().int().default(0),
  timestamp: z.date().default(() => new Date()),
  price: z.number().nonnegative().default(0),
  lastPriceUpdate: z.date().default(() => new Date()),

  // Denormalized chain data
  chain_DeId: z.number(),
  chain_Name: z.string(),
  chain_IsEnabled: z.boolean().default(true),

  // Denormalized logo data
  logo_Id: z.string().uuid(),
  logo_TokenId: z.string().uuid().optional(),
  logo_BigRelativePath: z.string(),
  logo_SmallRelativePath: z.string(),
  logo_ThumbRelativePath: z.string(),
});

// Type derived from the schema
export type TokenData = z.infer<typeof tokenSchema>;

// Helper function to validate token data
export function validateToken(data: Partial<TokenData>): TokenData {
  return tokenSchema.parse(data);
}

// Helper function to validate partial token data (for updates)
export function validatePartialToken(
  data: Partial<TokenData>
): Partial<TokenData> {
  return tokenSchema.partial().parse(data);
}
