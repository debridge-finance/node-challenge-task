import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { TokenPriceUpdateService } from './token-price-update.service';
import { Token } from '../models/token.entity';
import { OutboxEvent, OutboxEventStatus } from '../models/outbox-event.entity';
import { MockPriceService } from './mock-price.service';
import { KafkaProducerService } from '../kafka/kafka-producer.service';
import { INJECT_TOKENS } from '../utils/injectTokens';
import { PriceUpdateConfig } from './types';

describe('TokenPriceUpdateService', () => {
  let service: TokenPriceUpdateService;
  let tokenRepository: Repository<Token>;
  let outboxRepository: Repository<OutboxEvent>;
  let priceService: MockPriceService;
  let kafkaProducer: KafkaProducerService;
  let dataSource: DataSource;

  const mockToken: Token = {
    id: 'b47ac10b-58cc-4372-a567-0e02b2c3d479',
    address: '0x1234567890123456789012345678901234567890',
    symbol: 'TEST',
    name: 'Test Token',
    decimals: 18,
    isNative: false,
    chainId: 'b47ac10b-58cc-4372-a567-0e02b2c3d478',
    chain: null,
    logo: null,
    isProtected: false,
    lastUpdateAuthor: null,
    priority: 0,
    timestamp: new Date(),
    price: 100,
    lastPriceUpdate: new Date(),
  };

  const mockConfig: PriceUpdateConfig = {
    intervalSeconds: 5,
    batchSize: 10,
    parallelUpdates: false,
    maxRetries: 3,
    retryDelayMs: 1000,
    maxRetryDelayMs: 5000,
    outbox: {
      processingIntervalMs: 1000,
      batchSize: 10,
      maxRetries: 3,
      cleanupIntervalMs: 3600000,
      retentionHours: 24
    }
  };

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    setLock: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
    getMany: jest.fn(),
  };

  const mockTokenRepository = {
    count: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockOutboxQueryBuilder = {
    delete: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    execute: jest.fn(),
  };

  const mockOutboxRepository = {
    find: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => mockOutboxQueryBuilder),
  };

  const mockPriceService = {
    getRandomPriceForToken: jest.fn(),
  };

  const mockKafkaProducer = {
    sendPriceUpdateMessage: jest.fn(),
  };

  const mockManagerQueryBuilder = {
    setLock: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
  };

  const mockManager = {
    save: jest.fn(),
    create: jest.fn(),
    createQueryBuilder: jest.fn(() => mockManagerQueryBuilder),
  };

  const mockDataSource = {
    transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.spyOn(global, 'setInterval');
    jest.spyOn(global, 'clearInterval');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenPriceUpdateService,
        {
          provide: getRepositoryToken(Token),
          useValue: mockTokenRepository,
        },
        {
          provide: getRepositoryToken(OutboxEvent),
          useValue: mockOutboxRepository,
        },
        {
          provide: INJECT_TOKENS.PRICE_UPDATE_CONFIG,
          useValue: mockConfig,
        },
        {
          provide: MockPriceService,
          useValue: mockPriceService,
        },
        {
          provide: KafkaProducerService,
          useValue: mockKafkaProducer,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<TokenPriceUpdateService>(TokenPriceUpdateService);
    tokenRepository = module.get<Repository<Token>>(getRepositoryToken(Token));
    outboxRepository = module.get<Repository<OutboxEvent>>(getRepositoryToken(OutboxEvent));
    priceService = module.get<MockPriceService>(MockPriceService);
    kafkaProducer = module.get<KafkaProducerService>(KafkaProducerService);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('start', () => {
    it('should start the service and set up interval', () => {
      mockTokenRepository.count.mockResolvedValue(1);
      mockTokenRepository.find.mockResolvedValue([mockToken]);
      mockQueryBuilder.getMany.mockResolvedValue([mockToken]);
      mockPriceService.getRandomPriceForToken.mockResolvedValue(150);
      mockDataSource.transaction.mockImplementation(async (fn) => fn(mockManager));
      mockManagerQueryBuilder.getOne.mockResolvedValue(mockToken);
      mockOutboxRepository.find.mockResolvedValue([]);

      service.start();

      expect(service['isRunning']).toBe(true);
      expect(setInterval).toHaveBeenCalledWith(
        expect.any(Function),
        mockConfig.intervalSeconds * 1000,
      );
    });

    it('should not start if already running', () => {
      service['isRunning'] = true;
      const logSpy = jest.spyOn(service['logger'], 'warn');

      service.start();

      expect(logSpy).toHaveBeenCalledWith('Price update service is already running');
    });
  });

  describe('stop', () => {
    it('should stop the service and clear interval', () => {
      service['isRunning'] = true;
      service['timer'] = setInterval(() => {}, 1000);
      service['outboxTimer'] = setInterval(() => {}, 1000);
      service['cleanupTimer'] = setInterval(() => {}, 1000);

      service.stop();

      expect(service['isRunning']).toBe(false);
      expect(clearInterval).toHaveBeenCalledWith(service['timer']);
      expect(clearInterval).toHaveBeenCalledWith(service['outboxTimer']);
      expect(clearInterval).toHaveBeenCalledWith(service['cleanupTimer']);
    });

    it('should not stop if not running', () => {
      service['isRunning'] = false;
      const logSpy = jest.spyOn(service['logger'], 'warn');

      service.stop();

      expect(logSpy).toHaveBeenCalledWith('Price update service is not running');
    });
  });

  describe('updatePrices', () => {
    beforeEach(() => {
      jest.useRealTimers();
      jest.clearAllMocks();
    });
    
    afterEach(() => {
      jest.useFakeTimers();
    });
    it('should update prices for all tokens sequentially', async () => {
      const tokens = [mockToken, { ...mockToken, id: 'b47ac10b-58cc-4372-a567-0e02b2c3d480', symbol: 'TEST2' }];
      mockTokenRepository.count.mockResolvedValue(2);
      mockTokenRepository.find.mockResolvedValue(tokens);
      mockQueryBuilder.getMany.mockResolvedValue(tokens);
      mockPriceService.getRandomPriceForToken
        .mockResolvedValueOnce(150)
        .mockResolvedValueOnce(200);
      mockDataSource.transaction.mockImplementation(async (fn) => fn(mockManager));
      mockManagerQueryBuilder.getOne.mockResolvedValue(mockToken);

      await expect(service['updatePrices']()).resolves.not.toThrow();

      expect(tokenRepository.count).toHaveBeenCalled();
      expect(tokenRepository.createQueryBuilder).toHaveBeenCalled();
      expect(priceService.getRandomPriceForToken).toHaveBeenCalledTimes(2);
    }, 10000);

    it('should update prices for all tokens in parallel when configured', async () => {
      // Ensure timers are mocked before creating the module
      jest.useFakeTimers();
      jest.spyOn(global, 'setInterval');
      jest.spyOn(global, 'clearInterval');
      
      const parallelConfig = { ...mockConfig, parallelUpdates: true };
      const module = await Test.createTestingModule({
        providers: [
          TokenPriceUpdateService,
          {
            provide: getRepositoryToken(Token),
            useValue: mockTokenRepository,
          },
          {
            provide: getRepositoryToken(OutboxEvent),
            useValue: mockOutboxRepository,
          },
          {
            provide: INJECT_TOKENS.PRICE_UPDATE_CONFIG,
            useValue: parallelConfig,
          },
          {
            provide: MockPriceService,
            useValue: mockPriceService,
          },
          {
            provide: KafkaProducerService,
            useValue: mockKafkaProducer,
          },
          {
            provide: DataSource,
            useValue: mockDataSource,
          },
        ],
      }).compile();

      const parallelService = module.get<TokenPriceUpdateService>(TokenPriceUpdateService);

      const tokens = [mockToken, { ...mockToken, id: 'b47ac10b-58cc-4372-a567-0e02b2c3d480', symbol: 'TEST2' }];
      mockTokenRepository.count.mockResolvedValue(2);
      mockTokenRepository.find.mockResolvedValue(tokens);
      mockQueryBuilder.getMany.mockResolvedValue(tokens);
      mockPriceService.getRandomPriceForToken.mockResolvedValue(150);
      mockDataSource.transaction.mockImplementation(async (fn) => fn(mockManager));
      mockManager.save.mockResolvedValue({});
      mockManager.create.mockReturnValue({});
      mockManagerQueryBuilder.getOne.mockResolvedValue(mockToken);
      mockOutboxRepository.find.mockResolvedValue([]);

      await expect(parallelService['updatePrices']()).resolves.not.toThrow();

      expect(priceService.getRandomPriceForToken).toHaveBeenCalledTimes(2);
    }, 10000);

    it('should handle errors gracefully', async () => {
      mockTokenRepository.count.mockRejectedValue(new Error('Database error'));
      const logSpy = jest.spyOn(service['logger'], 'error');

      await expect(service['updatePrices']()).resolves.not.toThrow();

      expect(logSpy).toHaveBeenCalledWith('Error updating prices: Database error');
    });
  });

  describe('updateTokenPrice', () => {
    beforeEach(() => {
      jest.useRealTimers();
      jest.clearAllMocks();
    });
    
    afterEach(() => {
      jest.useFakeTimers();
    });
    it('should update token price and create outbox event when price changes', async () => {
      const newPrice = 150;
      // Mock will be called once (successful on first attempt)
      mockPriceService.getRandomPriceForToken.mockResolvedValue(newPrice);
      mockDataSource.transaction.mockImplementation(async (fn) => fn(mockManager));
      mockManager.create.mockReturnValue({});
      mockManager.save.mockResolvedValue({});
      mockManagerQueryBuilder.getOne.mockResolvedValue(mockToken);

      // Use a token with different price to ensure transaction is called
      const tokenWithDifferentPrice = { ...mockToken, price: 100 };
      await service['updateTokenPrice'](tokenWithDifferentPrice);

      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(mockManager.save).toHaveBeenCalledWith(expect.objectContaining({
        ...mockToken,
        price: newPrice,
        lastPriceUpdate: expect.any(Date),
      }));
      expect(mockManager.create).toHaveBeenCalledWith(OutboxEvent, expect.objectContaining({
        aggregateId: mockToken.id,
        eventType: 'TOKEN_PRICE_UPDATED',
        status: OutboxEventStatus.PENDING,
      }));
    });

    it('should not create outbox event when price doesnt change', async () => {
      // Return same price as mock token has (100)
      mockPriceService.getRandomPriceForToken.mockResolvedValue(100);
      
      // Ensure the mock token has the same price as what will be returned
      const tokenWithPrice = { ...mockToken, price: 100 };

      await service['updateTokenPrice'](tokenWithPrice);

      // retryWithBackoff will call it once (successful on first attempt)
      expect(priceService.getRandomPriceForToken).toHaveBeenCalledTimes(1);
      expect(mockDataSource.transaction).not.toHaveBeenCalled();
    });

    it('should retry on failure', async () => {
      // Use fake timers to speed up the test
      jest.useFakeTimers();
      
      const newPrice = 150;
      mockPriceService.getRandomPriceForToken
        .mockRejectedValueOnce(new Error('API error'))
        .mockResolvedValue(newPrice);
      mockDataSource.transaction.mockImplementation(async (fn) => fn(mockManager));
      mockManager.create.mockReturnValue({});
      mockManager.save.mockResolvedValue({});
      mockManagerQueryBuilder.getOne.mockResolvedValue(mockToken);

      // Use a token with different price to ensure transaction is called
      const tokenWithDifferentPrice = { ...mockToken, price: 100 };
      
      const updatePromise = service['updateTokenPrice'](tokenWithDifferentPrice);
      
      // Fast-forward through the retry delay
      await jest.runAllTimersAsync();
      await updatePromise;

      // 1 error + 1 successful call = 2 total calls
      expect(priceService.getRandomPriceForToken).toHaveBeenCalledTimes(2);
      expect(mockManager.save).toHaveBeenCalled();
      
      jest.useRealTimers();
    });

    it('should stop after max retries', async () => {
      // Use fake timers to speed up the test
      jest.useFakeTimers();
      mockPriceService.getRandomPriceForToken.mockRejectedValue(new Error('API error'));
      const logSpy = jest.spyOn(service['logger'], 'error');

      const updatePromise = service['updateTokenPrice'](mockToken);
      
      // Fast-forward through all timers
      await jest.runAllTimersAsync();
      await updatePromise;

      // With config maxRetries=3, retryWithBackoff will be called 3 times, each failing 3 times = 9 calls
      expect(priceService.getRandomPriceForToken).toHaveBeenCalledTimes(9);
      expect(logSpy).toHaveBeenCalledWith(
        `Failed to update price for token ${mockToken.symbol} after 3 attempts`
      );
      
      jest.useRealTimers();
    });
  });

  describe('processOutboxEvents', () => {
    beforeEach(() => {
      jest.useRealTimers();
      jest.clearAllMocks();
    });
    
    afterEach(() => {
      jest.useFakeTimers();
    });
    it('should process pending outbox events', async () => {
      const pendingEvent = {
        id: 'event-id',
        status: OutboxEventStatus.PENDING,
        payload: {
          tokenId: 'test-id',
          symbol: 'TEST',
          oldPrice: 100,
          newPrice: 150,
          timestamp: new Date().toISOString(),
        },
        retryCount: 0,
      };

      mockOutboxRepository.find.mockResolvedValue([pendingEvent]);
      mockKafkaProducer.sendPriceUpdateMessage.mockResolvedValue(undefined);

      await service['processOutboxEvents']();

      expect(outboxRepository.find).toHaveBeenCalledWith({
        where: { status: OutboxEventStatus.PENDING },
        order: { createdAt: 'ASC' },
        take: 10,
      });
      expect(kafkaProducer.sendPriceUpdateMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          ...pendingEvent.payload,
          timestamp: expect.any(Date),
        })
      );
      expect(outboxRepository.remove).toHaveBeenCalledWith(pendingEvent);
    });

    it('should handle Kafka send failures', async () => {
      const pendingEvent = {
        id: 'event-id',
        status: OutboxEventStatus.PENDING,
        payload: {
          tokenId: 'test-id',
          symbol: 'TEST',
          oldPrice: 100,
          newPrice: 150,
          timestamp: new Date().toISOString(),
        },
        retryCount: 0,
      };

      mockOutboxRepository.find.mockResolvedValue([pendingEvent]);
      mockKafkaProducer.sendPriceUpdateMessage.mockRejectedValue(new Error('Kafka error'));

      await service['processOutboxEvents']();

      expect(outboxRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ...pendingEvent,
          status: OutboxEventStatus.PENDING, // Reset to pending for retry
          retryCount: 1,
          error: 'Kafka error',
        })
      );
    });

    it('should mark as failed after max retries', async () => {
      const pendingEvent = {
        id: 'event-id',
        status: OutboxEventStatus.PENDING,
        payload: {
          tokenId: 'test-id',
          symbol: 'TEST',
          oldPrice: 100,
          newPrice: 150,
          timestamp: new Date().toISOString(),
        },
        retryCount: 2, // Already retried twice
      };

      mockOutboxRepository.find.mockResolvedValue([pendingEvent]);
      mockKafkaProducer.sendPriceUpdateMessage.mockRejectedValue(new Error('Kafka error'));

      await service['processOutboxEvents']();

      expect(outboxRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ...pendingEvent,
          status: OutboxEventStatus.FAILED,
          retryCount: 3,
          error: 'Kafka error',
        })
      );
    });
  });

  describe('cleanupOldOutboxEvents', () => {
    it('should cleanup old failed events', async () => {
      const affectedRows = 5;
      mockOutboxQueryBuilder.execute.mockResolvedValue({ affected: affectedRows });
      const logSpy = jest.spyOn(service['logger'], 'log');

      await service['cleanupOldOutboxEvents']();

      expect(outboxRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockOutboxQueryBuilder.delete).toHaveBeenCalled();
      expect(mockOutboxQueryBuilder.from).toHaveBeenCalledWith(OutboxEvent);
      expect(mockOutboxQueryBuilder.where).toHaveBeenCalledWith('status = :status', { 
        status: OutboxEventStatus.FAILED 
      });
      expect(mockOutboxQueryBuilder.andWhere).toHaveBeenCalledWith('createdAt < :cutoffDate', 
        expect.objectContaining({ cutoffDate: expect.any(Date) })
      );
      expect(logSpy).toHaveBeenCalledWith(`Cleaned up ${affectedRows} old failed outbox events`);
    });

    it('should not log when no events are cleaned up', async () => {
      mockOutboxQueryBuilder.execute.mockResolvedValue({ affected: 0 });
      const logSpy = jest.spyOn(service['logger'], 'log');

      await service['cleanupOldOutboxEvents']();

      expect(logSpy).not.toHaveBeenCalledWith(expect.stringContaining('Cleaned up'));
    });
  });

  describe('onModuleDestroy', () => {
    it('should stop the service', () => {
      const stopSpy = jest.spyOn(service, 'stop');
      
      service.onModuleDestroy();

      expect(stopSpy).toHaveBeenCalled();
    });
  });
});