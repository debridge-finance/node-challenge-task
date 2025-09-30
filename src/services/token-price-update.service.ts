import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from '../models/token.entity';
import { MockPriceService } from './mock-price.service';
import { KafkaProducerService } from '../kafka/kafka-producer.service';
import { createTokenPriceUpdateMessage } from '../models/token-price-update-message';

@Injectable()
export class TokenPriceUpdateService implements OnModuleDestroy {
  private readonly logger = new Logger(TokenPriceUpdateService.name);
  private timer: NodeJS.Timeout;
  private readonly updateIntervalSeconds: number = 5;
  private isRunning = false;

  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    private readonly priceService: MockPriceService,
    private readonly kafkaProducer: KafkaProducerService
  ) {}

  start(): void {
    if (this.isRunning) {
      this.logger.warn('Price update service is already running');
      return;
    }

    this.isRunning = true;
    this.logger.log(`Starting price update service (interval: ${this.updateIntervalSeconds} seconds)...`);

    // Вместо таймеров лучше использовать cron job (@nestjs/schedule)
    this.timer = setInterval(() => {
      console.log('start timer');
      this.updatePrices().catch((error) => {
        this.logger.error(`Error in price update interval: ${error.message}`);
      });
    }, this.updateIntervalSeconds * 1000);

    // Trigger an initial update immediately
    this.updatePrices().catch((error) => {
      this.logger.error(`Error in initial price update: ${error.message}`);
    });
  }

  private async updatePrices(): Promise<void> {
    try {
      const tokens = await this.tokenRepository.find();
      this.logger.log(`Updating prices for ${tokens.length} tokens...`);

      // NOTE: Писать данные в бд по очереди не эффективно, сначала обрабатываем потом пишем пачкой
      for (const token of tokens) {
        await this.updateTokenPrice(token);
      }
    } catch (error) {
      this.logger.error(`Error updating prices: ${error.message}`);
    }
  }

  private async updateTokenPrice(token: Token): Promise<void> {
    try {
      const oldPrice = token.price;
      const newPrice = await this.priceService.getRandomPriceForToken(token);

      // NOTE: Улучшаем читабельность
      if (oldPrice === newPrice) return;
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
    } catch (error) {
      this.logger.error(`Error updating price for token ${token.id}: ${error.message}`);
    }
  }

  stop(): void {
    if (!this.isRunning) {
      this.logger.warn('Price update service is not running');
      return;
    }

    clearInterval(this.timer);
    this.isRunning = false;
    this.logger.log('Price update service stopped');
  }

  onModuleDestroy(): void {
    this.stop();
  }
}
