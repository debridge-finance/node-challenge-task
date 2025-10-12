import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from '../models/token.entity';
import { MockPriceProvider } from './mock-price.provider';
import { ProducerService } from './producer.service';
import { createTokenPriceUpdateMessage } from '../models/token-price-update-message';

@Injectable()
export class TokenPriceUpdateService {
  private readonly logger = new Logger(TokenPriceUpdateService.name);

  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    private readonly priceService: MockPriceProvider,
    private readonly kafkaProducer: ProducerService,
  ) {}

  public async updatePrices(): Promise<void> {
    try {
      const tokens = await this.tokenRepository.find();

      this.logger.log(`Updating prices for ${tokens.length} tokens...`);
      for await (const token of tokens) this.updateTokenPrice(token);
    } catch (error) {
      this.logger.error(`Error updating prices: ${error.message}`);
    }
  }

  private async updateTokenPrice(token: Token): Promise<void> {
    try {
      const oldPrice =
        typeof token.price === 'string' ? parseFloat(token.price) : Number(token.price);

      const newPrice = await this.priceService.getRandomPriceForToken(token);

      if (oldPrice !== newPrice) {
        const message = createTokenPriceUpdateMessage({
          tokenId: token.id,
          symbol: token.symbol || 'UNKNOWN',
          oldPrice,
          newPrice,
        });

        await this.kafkaProducer.sendPriceUpdateMessage(message);

        token.price = newPrice;
        token.lastPriceUpdate = new Date();

        await this.tokenRepository.save(token);
        this.logger.log(`Updated price for ${token.symbol}: ${oldPrice} -> ${newPrice}`);
      }
    } catch (error) {
      this.logger.error(`Error updating price for token ${token.id}: ${error.message}`);
    }
  }
}
