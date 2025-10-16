import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

export const tokenBatchMessageSchema = z.object({
  tokens: z.array(
    z.object({
      id: z.string().uuid(),
      symbol: z.string().min(1),
      oldPrice: z.number().nonnegative(),
    }),
  ),
  batchId: z.string().uuid(),
  timestamp: z.date(),
});

export type TokenBatchMessage = z.infer<typeof tokenBatchMessageSchema>;

export function createTokenBatchMessage(data: {
  tokens: Array<{ id: string; symbol: string; oldPrice: number }>;
  batchId?: string;
  timestamp?: Date;
}): TokenBatchMessage {
  return tokenBatchMessageSchema.parse({
    ...data,
    batchId: data.batchId || uuidv4(),
    timestamp: data.timestamp || new Date(),
  });
}
