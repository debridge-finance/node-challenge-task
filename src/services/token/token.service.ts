import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { KafkaService } from '@/drivers/kafka';
import { TokenEntity, createTokenPriceUpdateMessage } from '@/models/token';
import { PriceService } from './price';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    @InjectRepository(TokenEntity)
    private readonly tokenRepository: Repository<TokenEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly priceService: PriceService,
    private readonly kafkaProducer: KafkaService,
  ) {}

  public async updatePrices(): Promise<void> {
    try {
      /*
      !: Since the timer was set to 5 seconds, I assume the number of tokens is fixed and less than +-100.
      If there are many more, streams should be used.
       */
      const tokens = await this.tokenRepository.find();
      this.logger.verbose(`Updating prices for ${tokens.length} tokens...`);
      await this.updateTokensPrices(tokens);
    } catch (error) {
      this.logger.error(`Error updating prices: ${error.message}`);
    }
  }

  private async updateTokensPrices(tokens: TokenEntity[]): Promise<void> {
    try {
      const newPrices = await this.priceService.getPricesForTokens(tokens);
      let promises = tokens.map((t, i) => {
        const oldPrice = t.price;
        const newPrice = newPrices[i]!;

        const message = createTokenPriceUpdateMessage({
          tokenId: t.id,
          symbol: t.symbol || 'UNKNOWN',
          oldPrice,
          newPrice,
          // timestamp will be set to current date by default if not provided
        });

        return this.dataSource.transaction(async (manager) => {
          const tokenRepo: Repository<TokenEntity> =
            manager.getRepository(TokenEntity);

          t.price = newPrice;
          t.lastPriceUpdate = new Date(); // !: Or, we could just use @UpdateDateColumn

          await tokenRepo.save(t);
          this.logger.log(
            `Updated price for ${t.symbol}: ${oldPrice} -> ${newPrice}`,
          );
          // After save to DB
          await this.kafkaProducer.sendPriceUpdateMessage(message);
        });
      });
      await Promise.all(promises);
    } catch (error) {
      this.logger.error(`Error updating prices for tokens: ${error.message}`);
    }
  }
}
