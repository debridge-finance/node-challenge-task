import { z } from 'zod';
import { Token } from './token.entity';
import { chainSchema } from './chain.schema';
import { logoSchema } from './logo.schema';

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

  chainId: z.string().uuid(),
  chain: chainSchema.optional(),

  logoId: z.string().uuid(),
  logo: logoSchema.optional(),

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
