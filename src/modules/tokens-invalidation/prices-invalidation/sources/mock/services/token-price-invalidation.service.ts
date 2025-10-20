import { Injectable, Logger } from "@nestjs/common";
import { TokenRepository } from "../../../../../tokens/repository/token.repository";
import { TokenPricesRepository } from "../../../../../token-prices/repository/token-prices.repository";
import { Token } from "../../../../../tokens/entities/token.entity";
import { MockPriceService } from "./mock-price.service";
import { TokenPriceKafkaService } from "../../../services/token-price-kafka.service";
import { TokenPrices } from "../../../../../token-prices/entity/token-prices.entity";
import { TOKENS_SOURCES } from "../../../../../tokens/libs/constants/token-sources.const";

interface TokenPriceUpdate {
  token: Token;
  oldPrice: string;
  newPrice: number;
}

@Injectable()
export class TokenPriceInvalidationService {
  private readonly logger = new Logger(TokenPriceInvalidationService.name);
  private readonly PAGE_LIMIT = 500;

  constructor(
    private readonly tokenRepository: TokenRepository,
    private readonly tokenPricesRepository: TokenPricesRepository,
    private readonly priceService: MockPriceService,
    private readonly tokenPriceKafka: TokenPriceKafkaService
  ) {}

  async invalidatePrices(): Promise<void> {
    this.logger.log("Starting price invalidation process...");

    try {
      const totalTokens = await this.tokenRepository.count();
      this.logger.log(`Total tokens to process: ${totalTokens}`);

      const totalPages = Math.ceil(totalTokens / this.PAGE_LIMIT);

      for (let page = 0; page < totalPages; page++) {
        await this.processBatch(page);
      }

      this.logger.log("Price invalidation process completed");
    } catch (error) {
      this.logger.error(`Error in price invalidation: ${error.message}`);
      throw error;
    }
  }

  private async processBatch(page: number): Promise<void> {
    const tokens = await this.tokenRepository.findPaginated({
      skip: page * this.PAGE_LIMIT,
      take: this.PAGE_LIMIT,
      relations: ["token_price"],
    });

    this.logger.log(
      `Processing batch ${page + 1}: ${tokens.length} tokens (offset: ${
        page * this.PAGE_LIMIT
      })`
    );

    const priceUpdates = await Promise.all(
      tokens.map(async (token) => {
        try {
          const newPrice = await this.priceService.getRandomPriceForToken(
            token
          );
          const oldPrice = token.token_price?.usd_price || "0";

          return {
            token,
            oldPrice,
            newPrice,
          };
        } catch (error) {
          this.logger.error(
            `Error fetching price for token ${token.id}: ${error.message}`
          );
          return null;
        }
      })
    );

    const validUpdates = priceUpdates.filter(
      (update): update is TokenPriceUpdate => update !== null
    );

    await this.updatePricesInBatch(validUpdates);
  }

  private async updatePricesInBatch(
    updates: TokenPriceUpdate[]
  ): Promise<void> {
    if (updates.length === 0) {
      return;
    }

    try {
      const tokenPricesToSave: TokenPrices[] = [];
      const tokensToUpdate: Token[] = [];
      const kafkaMessages: any[] = [];

      for (const { token, oldPrice, newPrice } of updates) {
        const newPriceStr = newPrice.toString();

        if (oldPrice !== newPriceStr) {
          let tokenPrice = token.token_price;

          if (!tokenPrice) {
            tokenPrice = this.tokenPricesRepository.create({
              usd_price: newPriceStr,
              last_updated_price_at: new Date(),
              last_updated_price_by_source: TOKENS_SOURCES.SEED,
            });

            token.token_price = tokenPrice;
            tokensToUpdate.push(token);
          } else {
            tokenPrice.usd_price = newPriceStr;
            tokenPrice.last_updated_price_at = new Date();
            tokenPrice.last_updated_price_by_source = TOKENS_SOURCES.SEED;
          }

          tokenPricesToSave.push(tokenPrice);

          kafkaMessages.push({
            tokenId: token.id,
            symbol: token.token_metadata?.symbol || "UNKNOWN",
            oldPrice: parseFloat(oldPrice),
            newPrice,
            timestamp: new Date(),
          });
        }
      }

      if (tokenPricesToSave.length) {
        await this.tokenPricesRepository.save(tokenPricesToSave);
        this.logger.log(`Updated ${tokenPricesToSave.length} token prices`);
      }

      if (tokensToUpdate.length) {
        await this.tokenRepository.save(tokensToUpdate);
        this.logger.log(`Linked ${tokensToUpdate.length} tokens to new prices`);
      }

      if (kafkaMessages.length) {
        await this.tokenPriceKafka.sendPriceUpdates(kafkaMessages);
      }
    } catch (error) {
      this.logger.error(`Error updating prices in batch: ${error.message}`);
      throw error;
    }
  }
}
