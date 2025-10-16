import { z } from 'zod';
import { Chain } from './chain.entity';

export const chainSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  isEnabled: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type ChainData = z.infer<typeof chainSchema>;

export function validateChain(data: Partial<ChainData>): Chain {
  const validatedData = chainSchema.parse(data);
  const chain = new Chain();

  Object.assign(chain, validatedData);

  return chain;
}

export function validatePartialChain(data: Partial<ChainData>): Partial<ChainData> {
  return chainSchema.partial().parse(data);
}
