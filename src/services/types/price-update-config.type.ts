export interface PriceUpdateConfig {
  intervalSeconds: number;
  batchSize: number;
  parallelUpdates: boolean;
  maxRetries: number;
  retryDelayMs: number;
  maxRetryDelayMs: number;
  outbox: {
    processingIntervalMs: number;
    batchSize: number;
    maxRetries: number;
    cleanupIntervalMs: number;
    retentionHours: number;
  };
}