// Price Update Constants
export const PRICE_UPDATE_INTERVAL = 5000; // 5 seconds
export const PRICE_UPDATE_BATCH_SIZE = 100;
export const PRICE_CHANGE_THRESHOLD_PERCENT = 0;

// Distributed Lock Constants
export const DISTRIBUTED_LOCK_TTL = 30000; // 30 seconds
export const DISTRIBUTED_LOCK_RETRY_DELAY = 1000; // 1 second
export const DISTRIBUTED_LOCK_MAX_RETRIES = 3;

// Outbox Constants
export const OUTBOX_FLUSH_LIMIT = 1000;
export const OUTBOX_FLUSH_INTERVAL = 5000; // 5 seconds

// Metrics Constants
export const METRICS_BUCKETS = [0.1, 0.5, 1, 2, 5, 10];
export const KAFKA_METRICS_BUCKETS = [0.01, 0.05, 0.1, 0.5, 1, 2];

// Retry Constants
export const DEFAULT_RETRY_DELAY = 1000;
export const DEFAULT_MAX_RETRIES = 3;
export const DEFAULT_TIMEOUT = 5000;

// Health Check Constants
export const HEALTH_CHECK_TIMEOUT = 5000;
export const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
