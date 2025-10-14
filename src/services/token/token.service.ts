import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KafkaService } from '@/drivers/kafka';
import { TokenEntity, createTokenPriceUpdateMessage } from '@/models/token';
import { PriceService } from './price';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    @InjectRepository(TokenEntity)
    private readonly tokenRepository: Repository<TokenEntity>,
    private readonly priceService: PriceService,
    private readonly kafkaProducer: KafkaService,
  ) {}

  public async updatePrices(): Promise<void> {
    try {
      const tokens = await this.tokenRepository.find();
      this.logger.verbose(`Updating prices for ${tokens.length} tokens...`);

      for (const token of tokens) {
        await this.updateTokenPrice(token);
      }
    } catch (error) {
      this.logger.error(`Error updating prices: ${error.message}`);
    }
  }

  private async updateTokenPrice(token: TokenEntity): Promise<void> {
    try {
      const oldPrice = token.price;
      const newPrice = await this.priceService.getRandomPriceForToken(token);

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
        token.lastPriceUpdate = new Date(); // !: Or, we could just use @UpdateDateColumn

        await this.tokenRepository.save(token);
        this.logger.log(
          `Updated price for ${token.symbol}: ${oldPrice} -> ${newPrice}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error updating price for token ${token.id}: ${error.message}`,
      );
    }
  }
}
