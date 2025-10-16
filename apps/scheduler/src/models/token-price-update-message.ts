import { z } from 'zod';

export const tokenPriceUpdateMessageSchema = z.object({
  tokenId: z.string().uuid(),
  symbol: z.string().min(1),
  oldPrice: z.number().nonnegative(),
  newPrice: z.number().nonnegative(),
  timestamp: z.union([z.date(), z.string().transform((str) => new Date(str))]),
});

export type TokenPriceUpdateMessage = z.infer<typeof tokenPriceUpdateMessageSchema>;

export function createTokenPriceUpdateMessage(data: {
  tokenId: string;
  symbol: string;
  oldPrice: number;
  newPrice: number;
  timestamp?: Date;
}): TokenPriceUpdateMessage {
  return tokenPriceUpdateMessageSchema.parse({
    ...data,
    timestamp: data.timestamp || new Date(),
  });
}
