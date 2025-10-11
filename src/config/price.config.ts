import { registerAs } from "@nestjs/config";

export interface PriceConfig {
  updateTimeoutMs: number;
  batchSize: number;
  minUpdateDelayMs: number;
  maxUpdateDelayMs: number;
  maxPrice: number;
}

export const getPriceConfig = (): PriceConfig => ({
  updateTimeoutMs: parseInt(process.env.PRICE_UPDATE_TIMEOUT ?? "5000", 10),
  batchSize: parseInt(process.env.PRICE_BATCH_SIZE ?? "1000", 10),
  minUpdateDelayMs: parseInt(process.env.PRICE_MIN_UPDATE_DELAY ?? "50", 10),
  maxUpdateDelayMs: parseInt(process.env.PRICE_MAX_UPDATE_DELAY ?? "200", 10),
  maxPrice: parseInt(process.env.PRICE_MAX_RANDOM ?? "100000", 10),
});

export default registerAs("price", getPriceConfig);
