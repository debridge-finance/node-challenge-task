// Injection tokens for dependency injection
export const INJECT_TOKENS = {
  KAFKA_PRODUCER_CONFIG: Symbol('KAFKA_PRODUCER_CONFIG'),
  PRICE_UPDATE_CONFIG: Symbol('PRICE_UPDATE_CONFIG'),
  MOCK_PRICE_SERVICE_CONFIG: Symbol('MOCK_PRICE_SERVICE_CONFIG'),
} as const;

export type InjectToken = typeof INJECT_TOKENS[keyof typeof INJECT_TOKENS];