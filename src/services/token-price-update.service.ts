import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from '../models/token.entity';
import { PriceService } from './price.service.interface';
import { KafkaProducerService } from '../kafka/kafka-producer.service';
import { createTokenPriceUpdateMessage } from '../models/token-price-update-message';
import { GetTokenPriceDto } from '../dto/token.dto';

@Injectable()
export class TokenPriceUpdateService implements OnModuleDestroy {
  private readonly logger = new Logger(TokenPriceUpdateService.name);
  private timer: NodeJS.Timeout | null = null;
  private readonly updateIntervalSeconds: number = 5;
  private isRunning: boolean = false;
  private isProcessing: boolean = false;

  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    private readonly priceService: PriceService,
    private readonly kafkaProducer: KafkaProducerService,
  ) {}

  start(): void {
    if (this.isRunning) {
      this.logger.warn('Price update service is already running');
      return;
    }

    this.isRunning = true;
    this.logger.log(`Starting price update service (interval: ${this.updateIntervalSeconds} seconds)...`);
        
    this.timer = setInterval(      
      async () => {
        // Предотвращаем параллельное выполнение
        if (this.isProcessing) {
          this.logger.warn('Price update already in progress, skipping this interval');
          return;
        }
        
        this.isProcessing = true;
        try {
          await this.updatePrices();
        } catch (error) {
          this.logger.error(`Error in price update interval: ${error.message}`);
        } finally {
          this.isProcessing = false;
        }
      },
      this.updateIntervalSeconds * 1000,
    );

    // Trigger an initial update immediately
    this.updatePrices().catch(error => {
      this.logger.error(`Error in initial price update: ${error.message}`);
    });
  }

  private async updatePrices(): Promise<void> {
    try {
      const tokens = await this.tokenRepository.find();
      this.logger.log(`Updating prices for ${tokens.length} tokens...`);
      
      // Параллельная обработка токенов с ограничением количества одновременных операций
      const batchSize = 5; // Обрабатываем по 5 токенов одновременно
      const batches = [];
      
      for (let i = 0; i < tokens.length; i += batchSize) {
        const batch = tokens.slice(i, i + batchSize);
        batches.push(batch);
      }
      
      // Обрабатываем батчи последовательно, но токены в батче параллельно
      for (const batch of batches) {
        await Promise.allSettled(
          batch.map(token => this.updateTokenPrice(token))
        );
      }
      
      this.logger.log(`Completed price updates for ${tokens.length} tokens`);
    } catch (error) {
      this.logger.error(`Error updating prices: ${error.message}`);      
    }
  }

  private async updateTokenPrice(token: Token): Promise<void> {
    try {
      const oldPrice = token.price;
      
      // Создаем DTO для передачи в сервис цен
      const tokenPriceDto: GetTokenPriceDto = {
        tokenId: token.id,
        symbol: token.symbol || 'UNKNOWN',
      };
      
      const newPrice = await this.priceService.getRandomPriceForToken(tokenPriceDto);
      
      if (oldPrice !== newPrice) {
        // Create message for Kafka using Zod helper function
        const message = createTokenPriceUpdateMessage({
          tokenId: token.id,
          symbol: token.symbol || 'UNKNOWN',
          oldPrice,
          newPrice,
          // timestamp will be set to current date by default if not provided
        });
        
        await this.kafkaProducer.sendPriceUpdateMessage(message);
        
        // Update token in database
        token.price = newPrice;
        token.lastPriceUpdate = new Date();
        
        await this.tokenRepository.save(token);
        this.logger.log(`Updated price for ${token.symbol}: ${oldPrice} -> ${newPrice}`);
      }
    } catch (error) {
      this.logger.error(`Error updating price for token ${token.id}: ${error.message}`);      
    }
  }

  stop(): void {
    if (!this.isRunning) {
      this.logger.warn('Price update service is not running');
      return;
    }

    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    this.isProcessing = false;
    this.logger.log('Price update service stopped');
  }

  onModuleDestroy(): void {
    this.stop();
  }
}
