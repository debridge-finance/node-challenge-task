import { z } from 'zod';
import { Logo } from './logo.entity';

export const logoSchema = z.object({
  id: z.string().uuid().optional(),
  tokenId: z.string().uuid().nullable().optional(),
  bigRelativePath: z.string(),
  smallRelativePath: z.string(),
  thumbRelativePath: z.string(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type LogoData = z.infer<typeof logoSchema>;

export function validateLogo(data: Partial<LogoData>): Logo {
  const validatedData = logoSchema.parse(data);
  const logo = new Logo();

  Object.assign(logo, validatedData);

  return logo;
}

export function validatePartialLogo(data: Partial<LogoData>): Partial<LogoData> {
  return logoSchema.partial().parse(data);
}
