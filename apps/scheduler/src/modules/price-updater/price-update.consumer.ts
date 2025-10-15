import { Controller, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from '../../models/token.entity';
import { tokenPriceUpdateMessageSchema } from '../../models/token-price-update-message';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class PriceUpdateConsumer {
  private readonly logger = new Logger(PriceUpdateConsumer.name);

  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
  ) {}

  @MessagePattern('token-price-updates')
  async handlePriceUpdate(message: unknown) {
    try {
      const parsedMessage = tokenPriceUpdateMessageSchema.parse(message);
      this.logger.log(`Received price update for token ${parsedMessage.tokenId}`);

      const token = await this.tokenRepository.findOne({ where: { id: parsedMessage.tokenId } });

      if (!token) {
        this.logger.warn(`Token ${parsedMessage.tokenId} not found in the database`);
        return;
      }

      token.price = parsedMessage.newPrice;
      token.lastPriceUpdate = new Date();

      await this.tokenRepository.save(token);
      this.logger.log(
        `Updated price for token ${token.symbol}: ${parsedMessage.oldPrice.toFixed(
          2,
        )} -> ${parsedMessage.newPrice.toFixed(2)}`,
      );
    } catch (error) {
      this.logger.error(`Error processing price update: ${error.message}`);
    }
  }
}
