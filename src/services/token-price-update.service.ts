import { Injectable, Logger, OnModuleDestroy, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Token } from '../models/token.entity';
import { OutboxEvent, OutboxEventStatus } from '../models/outbox-event.entity';
import { MockPriceService } from './mock-price.service';
import { KafkaProducerService } from '../kafka/kafka-producer.service';
import { createTokenPriceUpdateMessage } from '../models/token-price-update-message';
import { INJECT_TOKENS } from '../utils/injectTokens';
import { plainToInstance } from 'class-transformer';
import { TokenDto } from './dto/token.dto';
import { PriceUpdateConfig } from './types';

@Injectable()
export class TokenPriceUpdateService implements OnModuleDestroy {
  private readonly logger = new Logger(TokenPriceUpdateService.name);
  private timer: NodeJS.Timeout;
  private isRunning: boolean = false;
  private cleanupTimer: NodeJS.Timeout;

  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    @InjectRepository(OutboxEvent)
    private readonly outboxRepository: Repository<OutboxEvent>,
    @Inject(INJECT_TOKENS.PRICE_UPDATE_CONFIG) private readonly config: PriceUpdateConfig,
    private readonly priceService: MockPriceService,
    private readonly kafkaProducer: KafkaProducerService,
    private readonly dataSource: DataSource,
  ) {
    // Start outbox processor
    this.startOutboxProcessor();
  }

  start(): void {
    if (this.isRunning) {
      this.logger.warn('Price update service is already running');
      return;
    }

    this.isRunning = true;
    this.logger.log(`Starting price update service (interval: ${this.config.intervalSeconds} seconds, parallel: ${this.config.parallelUpdates})...`);
        
    this.timer = setInterval(      
      async () => {
        try {
          await this.updatePrices();
        } catch (error) {
          this.logger.error(`Error in price update interval: ${error.message}`);
        }
      },
      this.config.intervalSeconds * 1000,
    );

    // Trigger an initial update immediately
    this.updatePrices().catch(error => {
      this.logger.error(`Error in initial price update: ${error.message}`);
    });
  }

  private async updatePrices(): Promise<void> {
    try {
      const totalTokens = await this.tokenRepository.count();
      const cycleStartTime = Date.now();
      this.logger.log(`Starting price update for ${totalTokens} tokens (mode: ${this.config.parallelUpdates ? 'parallel' : 'sequential'})...`);
      
      const batchSize = this.config.batchSize || 10;
      const totalBatches = Math.ceil(totalTokens / batchSize);
      
      for (let page = 0; page < totalBatches; page++) {
        // Get tokens without lock for reading
        const tokens = await this.tokenRepository
          .createQueryBuilder('token')
          .leftJoinAndSelect('token.chain', 'chain')
          .leftJoinAndSelect('token.logo', 'logo')
          .take(batchSize)
          .skip(page * batchSize)
          .getMany();
        
        this.logger.log(`Processing batch ${page + 1}/${totalBatches} with ${tokens.length} tokens...`);
        
        if (this.config.parallelUpdates) {
          // Process batch in parallel
          const startTime = Date.now();
          await Promise.all(
            tokens.map(token => this.updateTokenPrice(token))
          );
          const duration = Date.now() - startTime;
          this.logger.log(`Batch ${page + 1}/${totalBatches} completed in ${duration}ms (parallel)`);
        } else {
          // Process batch sequentially
          const startTime = Date.now();
          for (const token of tokens) {
            await this.updateTokenPrice(token);
          }
          const duration = Date.now() - startTime;
          this.logger.log(`Batch ${page + 1}/${totalBatches} completed in ${duration}ms (sequential)`);
        }
      }
      
      const totalDuration = Date.now() - cycleStartTime;
      this.logger.log(`Price update cycle completed in ${totalDuration}ms`);
    } catch (error) {
      this.logger.error(`Error updating prices: ${error.message}`);      
    }
  }

  private async updateTokenPrice(tokenEntity: Token): Promise<void> {
    // Convert entity to DTO for validation
    const token = plainToInstance(TokenDto, tokenEntity, { excludeExtraneousValues: false });
    const maxRetries = this.config.maxRetries;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
      try {
        const oldPrice = typeof token.price === 'string' ? parseFloat(token.price) : token.price;
        const newPrice = await this.retryWithBackoff(
          () => this.priceService.getRandomPriceForToken(token),
          this.config.maxRetries,
          'fetch price'
        );
        
        if (oldPrice !== newPrice) {
          // Create message for Kafka using Zod helper function
          const message = createTokenPriceUpdateMessage({
            tokenId: token.id,
            symbol: token.symbol || 'UNKNOWN',
            oldPrice,
            newPrice,
            // timestamp will be set to current date by default if not provided
          });
          
          // Use transaction with outbox pattern for guaranteed delivery
          await this.dataSource.transaction(async (manager) => {
            // Lock the token row to prevent race conditions
            const lockedToken = await manager
              .createQueryBuilder(Token, 'token')
              .setLock('pessimistic_write')
              .where('token.id = :id', { id: tokenEntity.id })
              .getOne();
            
            if (!lockedToken) {
              this.logger.warn(`Token ${token.id} not found or locked by another process`);
              return; // Skip this token
            }
            
            // Update the token in database
            lockedToken.price = newPrice;
            lockedToken.lastPriceUpdate = new Date();
            await manager.save(lockedToken);
            
            // Create outbox event for eventual Kafka delivery
            const outboxEvent = manager.create(OutboxEvent, {
              aggregateId: token.id,
              eventType: 'TOKEN_PRICE_UPDATED',
              payload: message,
              status: OutboxEventStatus.PENDING,
            });
            await manager.save(outboxEvent);
            
            // The outbox processor will handle sending to Kafka
          });
          
          this.logger.log(`Updated price for ${token.symbol}: ${oldPrice} -> ${newPrice}`);
        }
        
        // Success - exit retry loop
        return;
      } catch (error) {
        retryCount++;
        
        // Check if it's a lock timeout or deadlock error
        const isLockError = error.message?.includes('lock') || 
                           error.code === '40P01' || // PostgreSQL deadlock_detected
                           error.code === '55P03';   // PostgreSQL lock_not_available
        
        if (isLockError) {
          this.logger.warn(
            `Lock conflict for token ${token.symbol} (attempt ${retryCount}/${maxRetries}), will retry`
          );
        } else {
          this.logger.error(
            `Error updating price for token ${token.symbol} (attempt ${retryCount}/${maxRetries}): ${error.message}`
          );
        }
        
        if (retryCount >= maxRetries) {
          this.logger.error(`Failed to update price for token ${token.symbol} after ${maxRetries} attempts`);
          // Don't throw - continue with other tokens
        } else {
          // Wait before retrying (shorter delay for lock conflicts)
          const baseDelay = isLockError ? 100 : this.config.retryDelayMs;
          const delay = Math.min(baseDelay * retryCount, this.config.maxRetryDelayMs);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
  }
  
  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number,
    operationName: string
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        this.logger.warn(
          `${operationName} failed (attempt ${attempt}/${maxRetries}): ${error.message}`
        );
        
        if (attempt < maxRetries) {
          const delay = Math.min(this.config.retryDelayMs * Math.pow(2, attempt - 1), this.config.maxRetryDelayMs);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError!;
  }

  private outboxTimer: NodeJS.Timeout;

  private startOutboxProcessor(): void {
    // Process outbox events based on configuration
    this.outboxTimer = setInterval(async () => {
      try {
        await this.processOutboxEvents();
      } catch (error) {
        this.logger.error(`Error processing outbox events: ${error.message}`);
      }
    }, this.config.outbox.processingIntervalMs);
    
    // Start cleanup timer for old failed events
    this.cleanupTimer = setInterval(async () => {
      try {
        await this.cleanupOldOutboxEvents();
      } catch (error) {
        this.logger.error(`Error cleaning up outbox events: ${error.message}`);
      }
    }, this.config.outbox.cleanupIntervalMs);
  }

  private async processOutboxEvents(): Promise<void> {
    // Get pending events
    const pendingEvents = await this.outboxRepository.find({
      where: { status: OutboxEventStatus.PENDING },
      order: { createdAt: 'ASC' },
      take: this.config.outbox.batchSize,
    });
    
    if (pendingEvents.length > 0) {
      this.logger.debug(`Processing ${pendingEvents.length} outbox events...`);
    }

    for (const event of pendingEvents) {
      try {
        // Parse and fix the payload (timestamp might be a string when loaded from DB)
        const payload = {
          ...event.payload,
          timestamp: new Date(event.payload.timestamp)
        };
        
        // Try to send to Kafka
        await this.kafkaProducer.sendPriceUpdateMessage(payload);
        
        // Delete successfully sent event
        await this.outboxRepository.remove(event);
        
        this.logger.debug(`Processed and removed outbox event ${event.id}`);
      } catch (error) {
        // Mark as failed and increment retry count
        event.status = OutboxEventStatus.FAILED;
        event.retryCount++;
        event.error = error.message;
        await this.outboxRepository.save(event);
        
        this.logger.error(`Failed to process outbox event ${event.id}: ${error.message}`);
        
        // Reset to pending if retry count is less than max retries
        if (event.retryCount < this.config.outbox.maxRetries) {
          event.status = OutboxEventStatus.PENDING;
          await this.outboxRepository.save(event);
        }
      }
    }
  }

  private async cleanupOldOutboxEvents(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - this.config.outbox.retentionHours);
    
    const result = await this.outboxRepository
      .createQueryBuilder()
      .delete()
      .from(OutboxEvent)
      .where('status = :status', { status: OutboxEventStatus.FAILED })
      .andWhere('createdAt < :cutoffDate', { cutoffDate })
      .execute();
    
    if (result.affected > 0) {
      this.logger.log(`Cleaned up ${result.affected} old failed outbox events`);
    }
  }

  stop(): void {
    if (!this.isRunning) {
      this.logger.warn('Price update service is not running');
      return;
    }

    clearInterval(this.timer);
    clearInterval(this.outboxTimer);
    clearInterval(this.cleanupTimer);
    this.isRunning = false;
    this.logger.log('Price update service stopped');
  }

  onModuleDestroy(): void {
    this.stop();
  }
}
