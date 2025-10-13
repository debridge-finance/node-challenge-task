import { z } from 'zod';
import { Token } from './token.entity';

export const tokenSchema = z.object({
  id: z.string().uuid().optional(),
  address: z.instanceof(Buffer),
  symbol: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  decimals: z.number().int().min(0).max(32767).default(0),
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

export type TokenData = z.infer<typeof tokenSchema>;

export function validateToken(data: Partial<TokenData>): Token {
  const validatedData = tokenSchema.parse(data);
  const token = new Token();

  Object.assign(token, validatedData);

  return token;
}

export function validatePartialToken(data: Partial<TokenData>): Partial<TokenData> {
  return tokenSchema.partial().parse(data);
}
