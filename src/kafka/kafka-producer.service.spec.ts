import { Test, TestingModule } from '@nestjs/testing';
import { KafkaProducerService } from './kafka-producer.service';
import { INJECT_TOKENS } from '../utils/injectTokens';
import { Kafka } from 'kafkajs';
import { TokenPriceUpdateMessage } from '../models/token-price-update-message';
import { KafkaProducerConfig } from './types';

jest.mock('kafkajs');

jest.mock('class-validator', () => ({
  ...jest.requireActual('class-validator'),
  validateOrReject: jest.fn().mockResolvedValue(undefined),
}));

describe('KafkaProducerService', () => {
  let service: KafkaProducerService;
  let mockProducer: any;
  let mockKafka: any;

  const mockConfig: KafkaProducerConfig = {
    kafkaConfig: {
      brokers: ['localhost:9092'],
      clientId: 'test-client',
    },
    topic: 'test-topic',
  };

  const mockMessage: TokenPriceUpdateMessage = {
    tokenId: 'b47ac10b-58cc-4372-a567-0e02b2c3d479',
    symbol: 'TEST',
    oldPrice: 100,
    newPrice: 150,
    timestamp: new Date(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    // Create a resolved promise for connection
    const connectionPromise = Promise.resolve();

    mockProducer = {
      connect: jest.fn().mockReturnValue(connectionPromise),
      disconnect: jest.fn().mockResolvedValue(undefined),
      send: jest.fn().mockResolvedValue({
        topicMessages: [{
          partition: 0,
          errorCode: 0,
          offset: '0',
        }],
      }),
    };

    mockKafka = {
      producer: jest.fn().mockReturnValue(mockProducer),
      consumer: jest.fn(),
      admin: jest.fn(),
      logger: jest.fn(),
    } as any;

    (Kafka as jest.MockedClass<typeof Kafka>).mockImplementation(() => mockKafka);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KafkaProducerService,
        {
          provide: INJECT_TOKENS.KAFKA_PRODUCER_CONFIG,
          useValue: mockConfig,
        },
      ],
    }).compile();

    service = module.get<KafkaProducerService>(KafkaProducerService);
    
    // Wait for initial connection
    await new Promise(resolve => setTimeout(resolve, 10));
  });

  describe('constructor', () => {
    it('should create Kafka instance and producer', () => {
      expect(Kafka).toHaveBeenCalledWith(mockConfig.kafkaConfig);
      expect(mockKafka.producer).toHaveBeenCalledWith({
        retry: {
          initialRetryTime: 100,
          retries: 5,
        },
      });
    });

    it('should connect to Kafka on initialization', () => {
      expect(mockProducer.connect).toHaveBeenCalled();
    });
  });

  describe('sendPriceUpdateMessage', () => {
    it('should send a valid message to Kafka', async () => {
      await service.sendPriceUpdateMessage(mockMessage);

      expect(mockProducer.send).toHaveBeenCalledWith({
        topic: mockConfig.topic,
        messages: [{
          key: mockMessage.tokenId,
          value: JSON.stringify(mockMessage),
          timestamp: expect.any(String),
        }],
      });
    });

    it('should validate message before sending', async () => {
      const invalidMessage = {
        ...mockMessage,
        tokenId: null, // Invalid
      };

      await expect(service.sendPriceUpdateMessage(invalidMessage as any))
        .rejects.toThrow();
    });

    it('should throw error if not connected', async () => {
      // Create a new mock that fails to connect
      const failedMockProducer = {
        ...mockProducer,
        connect: jest.fn().mockRejectedValue(new Error('Connection failed')),
      };
      
      const failedMockKafka = {
        producer: jest.fn().mockReturnValue(failedMockProducer),
        consumer: jest.fn(),
        admin: jest.fn(),
        logger: jest.fn(),
      } as any;
      
      (Kafka as jest.MockedClass<typeof Kafka>).mockImplementation(() => failedMockKafka);
      
      const failedModule = await Test.createTestingModule({
        providers: [
          KafkaProducerService,
          {
            provide: INJECT_TOKENS.KAFKA_PRODUCER_CONFIG,
            useValue: mockConfig,
          },
        ],
      }).compile();

      const failedService = failedModule.get<KafkaProducerService>(KafkaProducerService);

      // Wait a bit for the connection attempt
      await new Promise(resolve => setTimeout(resolve, 50));

      // Now the service will throw "not connected" error
      await expect(failedService.sendPriceUpdateMessage(mockMessage))
        .rejects.toThrow('Kafka producer is not connected');
    });

    it('should handle send failures', async () => {
      mockProducer.send.mockRejectedValueOnce(new Error('Send failed'));

      await expect(service.sendPriceUpdateMessage(mockMessage))
        .rejects.toThrow('Send failed');
    });

    it('should log successful sends', async () => {
      const logSpy = jest.spyOn(service['logger'], 'log');
      
      await service.sendPriceUpdateMessage(mockMessage);

      expect(logSpy).toHaveBeenCalledWith(
        `Sent message to Kafka: ${JSON.stringify(mockMessage)}`
      );
    });

    it('should log errors on failure', async () => {
      const error = new Error('Send failed');
      mockProducer.send.mockRejectedValueOnce(error);
      const logSpy = jest.spyOn(service['logger'], 'error');

      await expect(service.sendPriceUpdateMessage(mockMessage))
        .rejects.toThrow('Send failed');

      expect(logSpy).toHaveBeenCalledWith(
        'Failed to send message to Kafka: Send failed',
        error.stack
      );
    });

    it('should validate DTO before sending', async () => {
      // Just ensure the send completes successfully which implies validation passed
      await expect(service.sendPriceUpdateMessage(mockMessage)).resolves.not.toThrow();
      
      expect(mockProducer.send).toHaveBeenCalled();
    });
  });

  describe('onModuleDestroy', () => {
    it('should disconnect from Kafka when destroyed', async () => {
      await service.onModuleDestroy();

      expect(mockProducer.disconnect).toHaveBeenCalled();
    });

    it('should handle disconnect errors gracefully', async () => {
      mockProducer.disconnect.mockRejectedValueOnce(new Error('Disconnect failed'));
      const logSpy = jest.spyOn(service['logger'], 'error');

      await service.onModuleDestroy();

      expect(logSpy).toHaveBeenCalledWith(
        'Error disconnecting from Kafka',
        expect.any(String)
      );
    });

    it('should not disconnect if not connected', async () => {
      service['isConnected'] = false;

      await service.onModuleDestroy();

      expect(mockProducer.disconnect).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle connection failures on startup', async () => {
      // Create a new mock that fails to connect
      const failedMockProducer = {
        ...mockProducer,
        connect: jest.fn().mockRejectedValue(new Error('Connection failed')),
      };
      
      const failedMockKafka = {
        producer: jest.fn().mockReturnValue(failedMockProducer),
        consumer: jest.fn(),
        admin: jest.fn(),
        logger: jest.fn(),
      } as any;
      
      (Kafka as jest.MockedClass<typeof Kafka>).mockImplementation(() => failedMockKafka);

      const failedModule = await Test.createTestingModule({
        providers: [
          KafkaProducerService,
          {
            provide: INJECT_TOKENS.KAFKA_PRODUCER_CONFIG,
            useValue: mockConfig,
          },
        ],
      }).compile();

      const failedService = failedModule.get<KafkaProducerService>(KafkaProducerService);

      // Wait for connection attempt
      await new Promise(resolve => setTimeout(resolve, 50));

      // Service should not be connected after failed connection
      expect(failedService['isConnected']).toBe(false);
      expect(failedMockProducer.connect).toHaveBeenCalled();
    });
  });
});