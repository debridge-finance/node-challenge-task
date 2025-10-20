import { z } from "zod";

export const tokenPriceUpdateMessageSchema = z.object({
  tokenId: z.number(),
  symbol: z.string(),
  oldPrice: z.number(),
  newPrice: z.number(),
  timestamp: z.date(),
});

export type TokenPriceUpdateMessage = z.infer<
  typeof tokenPriceUpdateMessageSchema
>;
