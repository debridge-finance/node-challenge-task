import { z } from 'zod';

export const tokenPriceUpdateMessageSchema = z.object({
  tokenId: z.string().uuid(),
  symbol: z.string().min(1),
  oldPrice: z
    .union([z.number(), z.string().transform((val) => parseFloat(val))])
    .pipe(z.number().nonnegative()),
  newPrice: z
    .union([z.number(), z.string().transform((val) => parseFloat(val))])
    .pipe(z.number().nonnegative()),
  timestamp: z.date(),
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
