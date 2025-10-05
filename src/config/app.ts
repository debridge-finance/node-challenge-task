export default () => {
  const env = process.env.NODE_ENV || 'development'
  const port = parseInt(process.env.PORT || '3000', 10)
  
  return {
    env,
    isDevelopment: env === 'development',
    isProduction: env === 'production',
    isTest: env === 'test',
    port,
    globalPrefix: process.env.API_PREFIX || 'api',
    
    priceUpdate: {
      intervalSeconds: parseInt(process.env.UPDATE_INTERVAL_SECONDS || '5', 10),
      batchSize: parseInt(process.env.UPDATE_BATCH_SIZE || '10', 10),
      parallelUpdates: process.env.PARALLEL_UPDATES === 'true',
      maxRetries: parseInt(process.env.UPDATE_MAX_RETRIES || '3', 10),
      retryDelayMs: parseInt(process.env.UPDATE_RETRY_DELAY_MS || '1000', 10),
      maxRetryDelayMs: parseInt(process.env.UPDATE_MAX_RETRY_DELAY_MS || '5000', 10)
    },
    
    outbox: {
      processingIntervalMs: parseInt(process.env.OUTBOX_INTERVAL_MS || '1000', 10),
      batchSize: parseInt(process.env.OUTBOX_BATCH_SIZE || '10', 10),
      maxRetries: parseInt(process.env.OUTBOX_MAX_RETRIES || '3', 10),
      cleanupIntervalMs: parseInt(process.env.OUTBOX_CLEANUP_INTERVAL_MS || '3600000', 10), // 1 hour default
      retentionHours: parseInt(process.env.OUTBOX_RETENTION_HOURS || '24', 10) // Keep failed events for 24 hours
    },
    
    seed: {
      autoSeed: process.env.AUTO_SEED === 'true' && env !== 'production'
    },
    
    logging: {
      level: process.env.LOG_LEVEL || (env === 'production' ? 'info' : 'debug'),
      pretty: process.env.LOG_PRETTY === 'true' || env !== 'production'
    }
  }
}