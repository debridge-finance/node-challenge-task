import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { INJECT_TOKENS } from '../utils/injectTokens';

export const configProviders: Provider[] = [
  {
    provide: INJECT_TOKENS.KAFKA_PRODUCER_CONFIG,
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
      const kafkaConfig = configService.get('kafka');
      return {
        kafkaConfig: {
          clientId: kafkaConfig.clientId,
          brokers: kafkaConfig.brokers,
          connectionTimeout: kafkaConfig.connectionTimeout,
          requestTimeout: kafkaConfig.requestTimeout,
          retry: kafkaConfig.retry,
        },
        topic: kafkaConfig.topics.priceUpdates,
      };
    },
  },
  {
    provide: INJECT_TOKENS.PRICE_UPDATE_CONFIG,
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
      const priceUpdateConfig = configService.get('app.priceUpdate');
      const outboxConfig = configService.get('app.outbox');
      return {
        intervalSeconds: priceUpdateConfig.intervalSeconds,
        batchSize: priceUpdateConfig.batchSize,
        parallelUpdates: priceUpdateConfig.parallelUpdates,
        maxRetries: priceUpdateConfig.maxRetries,
        retryDelayMs: priceUpdateConfig.retryDelayMs,
        maxRetryDelayMs: priceUpdateConfig.maxRetryDelayMs,
        outbox: {
          processingIntervalMs: outboxConfig.processingIntervalMs,
          batchSize: outboxConfig.batchSize,
          maxRetries: outboxConfig.maxRetries,
          cleanupIntervalMs: outboxConfig.cleanupIntervalMs,
          retentionHours: outboxConfig.retentionHours,
        }
      };
    },
  },
  {
    provide: INJECT_TOKENS.MOCK_PRICE_SERVICE_CONFIG,
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
      const mockPriceConfig = configService.get('mockPrice');
      return {
        minDelay: mockPriceConfig.minDelay,
        maxDelay: mockPriceConfig.maxDelay,
        enableDelay: mockPriceConfig.enableDelay,
      };
    },
  },
];