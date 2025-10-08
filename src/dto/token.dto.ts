import { z } from 'zod';

// DTO для получения цены токена
export const GetTokenPriceDtoSchema = z.object({
  tokenId: z.string().uuid(),
  symbol: z.string().min(1),
});

export type GetTokenPriceDto = z.infer<typeof GetTokenPriceDtoSchema>;


