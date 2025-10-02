import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from '../models/token.entity';
import { MockPriceService } from './mock-price.service';
import { KafkaProducerService } from '../kafka/kafka-producer.service';
import { createTokenPriceUpdateMessage } from '../models/token-price-update-message';
import { chunk } from 'lodash';

// Антипаттерн: нарушение Single Responsibility, cлишком много ответственностей: таймеры, Kafka, БД и т.д
@Injectable()
export class TokenPriceUpdateService implements OnModuleDestroy {
  private readonly logger = new Logger(TokenPriceUpdateService.name);
  private timer: NodeJS.Timeout;
  private readonly updateIntervalSeconds: number = 5;
  private isRunning: boolean = false;
  private isTickActive: boolean = false;
  private readonly MAX_CONCURRENT_UPDATES = 5;

  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    private readonly priceService: MockPriceService,
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
        if (this.isTickActive) {
          this.logger.warn('Previous price update tick still running, skipping this interval');
          return;
        }
        this.isTickActive = true;
        try {
          await this.updatePrices();
        } catch (error) {
          this.logger.error(`Error in price update interval: ${error.message}`);
        } finally {
          this.isTickActive = false;
        }
      },
      this.updateIntervalSeconds * 1000,
    );

    // Trigger an initial update immediately
    (async () => {
      this.isTickActive = true;
      try {
        await this.updatePrices();
      } catch (error) {
        this.logger.error(`Error in initial price update: ${error.message}`);
      } finally {
        this.isTickActive = false;
      }
    })();
  }

  async updatePrices(): Promise<void> {
    try {
      const pageSize = 1000;
      let page = 0;
      let hasMore = true;
  
      while (hasMore) {
        const tokens = await this.tokenRepository.find({
          skip: page * pageSize,
          take: pageSize,
          order: { id: 'ASC' },
          select: ['id', 'symbol', 'price'],
        });
  
        if (tokens.length === 0) {
          hasMore = false;
          break;
        }
  
        this.logger.log(`Updating prices for page ${page + 1} (${tokens.length} tokens)...`);
  
        // Параллельная обработка внутри страницы
        const batches = chunk(tokens, this.MAX_CONCURRENT_UPDATES);
  
        for (const batch of batches) {
          const results = await Promise.allSettled(
            batch.map(token => this.updateTokenPrice(token))
          );
          this.processBatchResults(results);
        }
  
        page++;
      }
    } catch (error) {
      this.logger.error(`Error updating prices: ${error.message}`);
    }
  }
  
  // обработка результатов выполнения batch
  private processBatchResults(results: PromiseSettledResult<void>[]): void {
    const fulfilled = results.filter(result => result.status === 'fulfilled').length;
    const rejected = results.filter(result => result.status === 'rejected').length;
    
    if (rejected > 0) {
      this.logger.warn(`Batch completed: ${fulfilled} succeeded, ${rejected} failed`);
    } else {
      this.logger.log(`Batch completed: all ${fulfilled} operations succeeded`);
    }
  }

  private async updateTokenPrice(token: Token): Promise<void> {
    // согласованность БД и Kafka
    const queryRunner = this.tokenRepository.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();
    
    try {
      const oldPrice = token.price;
      const newPrice = await this.priceService.getRandomPriceForToken(token);
      
      if (this.shouldUpdatePrice(oldPrice, newPrice)) {
        // обновляем БД, затем отправляем в Kafka
        token.price = newPrice;
        token.lastPriceUpdate = new Date();
        await queryRunner.manager.save(token);
        
        await this.kafkaProducer.sendPriceUpdateMessage(
          createTokenPriceUpdateMessage({
            tokenId: token.id,
            symbol: token.symbol || 'UNKNOWN',
            oldPrice,
            newPrice,
          })
        );
        
        await queryRunner.commitTransaction();
        this.logger.log(`Updated price for ${token.symbol}: ${oldPrice} → ${newPrice}`);
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to update price for token ${token.id}: ${error.message}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // определение значимых изменений
  private shouldUpdatePrice(oldPrice: number, newPrice: number): boolean {
    const percentageChange = Math.abs((newPrice - oldPrice) / oldPrice);
    return percentageChange > 0.01; // 1% изменение
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
