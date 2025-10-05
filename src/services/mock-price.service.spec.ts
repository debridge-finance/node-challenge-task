import { Test, TestingModule } from '@nestjs/testing';
import { MockPriceService } from './mock-price.service';
import { INJECT_TOKENS } from '../utils/injectTokens';
import { MockPriceServiceConfig } from './types';
import { Token } from '../models/token.entity';
import { PriceRequestDto } from './dto/price.dto';

describe('MockPriceService', () => {
  let service: MockPriceService;
  let config: MockPriceServiceConfig;

  const mockToken: Token = {
    id: 'test-id',
    address: '0x1234567890123456789012345678901234567890',
    symbol: 'TEST',
    name: 'Test Token',
    decimals: 18,
    isNative: false,
    chainId: 'chain-id',
    chain: null,
    logo: null,
    isProtected: false,
    lastUpdateAuthor: null,
    priority: 0,
    timestamp: new Date(),
    price: 100,
    lastPriceUpdate: new Date(),
  };

  beforeEach(async () => {
    config = {
      minDelay: 100,
      maxDelay: 500,
      enableDelay: false,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MockPriceService,
        {
          provide: INJECT_TOKENS.MOCK_PRICE_SERVICE_CONFIG,
          useValue: config,
        },
      ],
    }).compile();

    service = module.get<MockPriceService>(MockPriceService);
  });

  describe('getRandomPriceForToken', () => {
    it('should return a positive number', async () => {
      const price = await service.getRandomPriceForToken(mockToken);
      
      expect(price).toBeGreaterThan(0);
      expect(typeof price).toBe('number');
    });

    it('should return different prices on multiple calls', async () => {
      const prices = await Promise.all([
        service.getRandomPriceForToken(mockToken),
        service.getRandomPriceForToken(mockToken),
        service.getRandomPriceForToken(mockToken),
        service.getRandomPriceForToken(mockToken),
        service.getRandomPriceForToken(mockToken),
      ]);

      // Check that we have some variation in prices
      const uniquePrices = new Set(prices);
      expect(uniquePrices.size).toBeGreaterThan(1);
    });

    it('should work with TokenDto as well', async () => {
      const tokenDto = { ...mockToken };
      const price = await service.getRandomPriceForToken(tokenDto);
      
      expect(price).toBeGreaterThan(0);
      expect(typeof price).toBe('number');
    });

    it('should apply delay when enabled', async () => {
      const delayConfig = { ...config, enableDelay: true, minDelay: 50, maxDelay: 100 };
      const module = await Test.createTestingModule({
        providers: [
          MockPriceService,
          {
            provide: INJECT_TOKENS.MOCK_PRICE_SERVICE_CONFIG,
            useValue: delayConfig,
          },
        ],
      }).compile();

      const delayService = module.get<MockPriceService>(MockPriceService);

      const startTime = Date.now();
      await delayService.getRandomPriceForToken(mockToken);
      const duration = Date.now() - startTime;

      expect(duration).toBeGreaterThanOrEqual(50);
      expect(duration).toBeLessThan(150);
    });
  });

  describe('getPriceForTokenDto', () => {
    it('should return a PriceResponseDto with correct structure', async () => {
      const priceRequest: PriceRequestDto = {
        tokenId: 'test-id',
        symbol: 'TEST',
      };

      const response = await service.getPriceForTokenDto(priceRequest);

      expect(response).toHaveProperty('tokenId', 'test-id');
      expect(response).toHaveProperty('price');
      expect(response.price).toBeGreaterThan(0);
      expect(typeof response.price).toBe('number');
    });

    it('should return different prices for the same token', async () => {
      const priceRequest: PriceRequestDto = {
        tokenId: 'test-id',
        symbol: 'TEST',
      };

      const responses = await Promise.all([
        service.getPriceForTokenDto(priceRequest),
        service.getPriceForTokenDto(priceRequest),
        service.getPriceForTokenDto(priceRequest),
      ]);

      const prices = responses.map(r => r.price);
      const uniquePrices = new Set(prices);
      expect(uniquePrices.size).toBeGreaterThan(1);
    });

    it('should apply delay when enabled', async () => {
      const delayConfig = { ...config, enableDelay: true, minDelay: 50, maxDelay: 100 };
      const module = await Test.createTestingModule({
        providers: [
          MockPriceService,
          {
            provide: INJECT_TOKENS.MOCK_PRICE_SERVICE_CONFIG,
            useValue: delayConfig,
          },
        ],
      }).compile();

      const delayService = module.get<MockPriceService>(MockPriceService);

      const priceRequest: PriceRequestDto = {
        tokenId: 'test-id',
        symbol: 'TEST',
      };

      const startTime = Date.now();
      await delayService.getPriceForTokenDto(priceRequest);
      const duration = Date.now() - startTime;

      expect(duration).toBeGreaterThanOrEqual(50);
      expect(duration).toBeLessThan(150);
    });
  });

  describe('price generation', () => {
    it('should generate prices within expected range', async () => {
      const prices = await Promise.all(
        Array.from({ length: 100 }, () => service.getRandomPriceForToken(mockToken))
      );

      for (const price of prices) {
        expect(price).toBeGreaterThan(0);
        expect(price).toBeLessThan(1000000);
      }
    });
  });
});