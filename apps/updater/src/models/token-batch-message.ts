import { z } from 'zod';

export const tokenBatchMessageSchema = z.object({
  tokens: z.array(
    z.object({
      id: z.string().uuid(),
      symbol: z.string().min(1),
    }),
  ),
  batchId: z.string().uuid(),
  timestamp: z.union([z.date(), z.string().transform((str) => new Date(str))]),
});

export type TokenBatchMessage = z.infer<typeof tokenBatchMessageSchema>;
