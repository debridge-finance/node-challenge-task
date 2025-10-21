import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Token } from '../models/token.entity';
import { MockPriceService } from './mock-price.service';
import { KafkaProducerService } from '../kafka/kafka-producer.service';
import { createTokenPriceUpdateMessage } from '../models/token-price-update-message';

@Injectable()
export class TokenPriceUpdateService {
  private readonly logger = new Logger(TokenPriceUpdateService.name);
  private isRunning: boolean = false;

  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    private readonly dataSource: DataSource,
    private readonly priceService: MockPriceService,
    private readonly kafkaProducer: KafkaProducerService,
  ) {
    this.logger.log('TokenPriceUpdateService has been instantiated x2');
  }

  // Use cron to schedule the price updates instead of setInterval => overlap protection, easier to test and manage
  @Cron(CronExpression.EVERY_5_SECONDS)
  async handleCron(): Promise<void> {
    this.logger.log('handleCron');
    if (this.isRunning) {
      this.logger.warn('Previous price update is still running, skipping this interval');
      return;
    }
    
    await this.updatePrices();
  }

  private async updatePrices(): Promise<void> {
    this.isRunning = true;
    console.log('updatePrices');
    try {
      const tokens = await this.tokenRepository.find();
      this.logger.log(`Updating prices for ${tokens.length} tokens...`);

      await Promise.all(tokens.map(token => this.updateTokenPrice(token)));
    } catch (error) {
      this.logger.error(`Error updating prices: ${error.message}`);
    } finally {
      this.isRunning = false;
    }
  }

  private async updateTokenPrice(token: Token): Promise<void> {
    const oldPrice = +token.price;
    const newPrice = await this.priceService.getRandomPriceForToken(token);
    try {
      
      if (oldPrice !== newPrice) {
        // Use transaction to ensure atomicity: send to Kafka first, then update DB
          // Create message for Kafka using Zod helper function
        this.logger.log(`Creating message for Kafka: ${token.id} ${token.symbol} ${typeof oldPrice} ${typeof newPrice}`);
        const message = createTokenPriceUpdateMessage({
          tokenId: token.id,
          symbol: token.symbol || 'UNKNOWN',
          oldPrice,
          newPrice,
        });

        
        // Send to Kafka should be async and should not block the transaction
        this.kafkaProducer.sendPriceUpdateMessage(message);
        
        // Update token in database within transaction
        token.price = newPrice;
        token.lastPriceUpdate = new Date();
        
        await this.tokenRepository.save(token);
      
        this.logger.log(`Updated price for ${token.symbol}: ${oldPrice} -> ${newPrice}`);
      }
    } catch (error) {
      this.logger.error(`Error updating price for token ${token.id}: ${error.message} ${oldPrice} ${newPrice}`);
      // Don't rethrow - we want to continue processing other tokens
    }
  }
}
