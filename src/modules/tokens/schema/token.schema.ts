import { z } from 'zod';

// Zod schema for token validation
export const tokenSchema = z.object({
    id: z.string().uuid().optional(),
    address: z.instanceof(Buffer),
    symbol: z.string().nullable().optional(),
    name: z.string().nullable().optional(),
    decimals: z.number().int().min(0).max(32767).default(0),
    isNative: z.boolean().default(false),
    chain_id: z.string().uuid(),
    logo_id: z.string().uuid(),
    isProtected: z.boolean().default(false),
    lastUpdateAuthor: z.string().nullable().optional(),
    priority: z.number().int().default(0),
    timestamp: z.date().default(() => new Date()),
    price: z.number().nonnegative().default(0),
    lastPriceUpdate: z.date().default(() => new Date()),
});

export type TokenData = z.infer<typeof tokenSchema>;

export function validateToken(data: Partial<TokenData>): TokenData {
    return tokenSchema.parse(data);
}

export function validatePartialToken(data: Partial<TokenData>): Partial<TokenData> {
    return tokenSchema.partial().parse(data);
}
