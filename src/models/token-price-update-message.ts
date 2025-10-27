// Fixes:
// timestamp optional + default	Works even if field missing
// String-to-Date transform	Safe when consuming JSON messages
// Price difference validation	Prevents redundant updates
// Symbol trimming	Avoids accidental whitespace issues
// Type-safe helper	Reuses same validation schema
import { z } from "zod";

/**
 * Zod schema for token price update messages
 * Production-safe version with validation, normalization, and defaults
 */
export const tokenPriceUpdateMessageSchema = z
  .object({
    tokenId: z.string().uuid(),
    symbol: z.string().trim().min(1, "Symbol cannot be empty"),
    oldPrice: z.number().nonnegative(),
    newPrice: z.number().nonnegative(),

    // Accept Date or ISO string, auto-transform to Date
    timestamp: z
      .union([z.date(), z.string().transform((val) => new Date(val))])
      .optional()
      .default(() => new Date()),
  })
  // Ensure price actually changed
  .refine((data) => data.newPrice !== data.oldPrice, {
    message: "newPrice must be different from oldPrice",
    path: ["newPrice"],
  });

/** ✅ Type derived from schema */
export type TokenPriceUpdateMessage = z.infer<
  typeof tokenPriceUpdateMessageSchema
>;

/** ✅ Helper function for creating validated messages */
export function createTokenPriceUpdateMessage(data: {
  tokenId: string;
  symbol: string;
  oldPrice: number;
  newPrice: number;
  timestamp?: Date | string;
}): TokenPriceUpdateMessage {
  return tokenPriceUpdateMessageSchema.parse(data);
}
