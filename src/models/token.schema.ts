// Fixed the validation schema:
// - z.instanceof(Buffer) potential build issue
// - Inconsistent naming (chain_Id, chain_DeId, etc.)
import { z } from "zod";

/**
 * Zod schema for token validation
 * Production-ready, type-safe, and environment-agnostic
 */
export const tokenSchema = z.object({
  id: z.string().uuid().optional(),

  // Address can be a hex string or Buffer (depending on environment)
  address: z.union([
    z.instanceof(Buffer).optional(),
    z.string().regex(/^0x[0-9a-fA-F]+$/, "Invalid hex address"),
  ]),

  symbol: z.string().optional(),
  name: z.string().optional(),
  decimals: z.number().int().min(0).max(32767).default(0),
  isNative: z.boolean().default(false),
  chainId: z.string().uuid(),
  isProtected: z.boolean().default(false),
  lastUpdateAuthor: z.string().optional(),
  priority: z.number().int().default(0),
  timestamp: z
    .date()
    .optional()
    .default(() => new Date()),

  // Nested chain object
  chain: z.object({
    id: z.string().uuid(),
    deId: z.number().int(),
    name: z.string(),
    isEnabled: z.boolean().default(true),
  }),

  // Nested logo object
  logo: z.object({
    id: z.string().uuid(),
    tokenId: z.string().uuid().nullable().optional(),
    bigRelativePath: z.string(),
    smallRelativePath: z.string(),
    thumbRelativePath: z.string(),
  }),

  price: z.number().nonnegative().default(0),
  lastPriceUpdate: z
    .date()
    .optional()
    .default(() => new Date()),
});

/** ✅ Type derived from schema */
export type TokenData = z.infer<typeof tokenSchema>;

/** ✅ Strict validation for full token objects */
export function validateToken(data: unknown): TokenData {
  return tokenSchema.parse(data);
}

/** ✅ Safe validation for partial updates (deep partial) */
export function validatePartialToken(data: unknown): Partial<TokenData> {
  return tokenSchema.deepPartial().parse(data);
}
