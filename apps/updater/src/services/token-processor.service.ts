import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Feed, FeedStatus } from '../models/feed.entity';
import { MockPriceProvider } from './mock-price.provider';
import { TokenUpdateProducer } from './token-update.producer';
import { createTokenPriceUpdateMessage } from '../models/token-price-update-message';

interface TokenUpdate {
  id: string;
  status: FeedStatus;
  oldPrice?: number;
  newPrice?: number;
  error?: string;
}

@Injectable()
export class TokenProcessorService {
  private readonly logger = new Logger(TokenProcessorService.name);

  constructor(
    @InjectRepository(Feed)
    private readonly feedRepository: Repository<Feed>,
    private readonly priceService: MockPriceProvider,
    private readonly kafkaProducer: TokenUpdateProducer,
  ) {}

  async processTokensBatch(tokens: Feed[]) {
    if (tokens.length === 0) {
      return;
    }

    this.logger.log(`Processing ${tokens.length} tokens...`);

    const tokenIds = tokens.map((token) => token.id);
    await this.feedRepository.update({ id: In(tokenIds) }, { status: FeedStatus.PROCESSING });

    const updates: TokenUpdate[] = [];

    for (const token of tokens) {
      try {
        const newPrice = await this.priceService.getRandomPriceForToken({ id: token.tokenId });

        const message = createTokenPriceUpdateMessage({
          tokenId: token.tokenId,
          symbol: token.symbol || 'UNKNOWN',
          oldPrice: token.oldPrice,
          newPrice,
        });

        await this.kafkaProducer.sendPriceUpdateMessage(message);

        updates.push({
          id: token.id,
          status: FeedStatus.PROCESSED,
          oldPrice: token.oldPrice,
          newPrice,
        });

        this.logger.log(`Processed token ${token.tokenId} with new price ${newPrice.toFixed(2)}`);
      } catch (error) {
        this.logger.error(`Error processing token ${token.tokenId}: ${error.message}`);

        updates.push({
          id: token.id,
          status: FeedStatus.FAILED,
          oldPrice: token.oldPrice,
          error: error.message,
        });
      }
    }

    await this.batchUpdateTokens(updates);

    this.logger.log(`Completed processing batch of ${tokens.length} tokens`);
  }

  private async batchUpdateTokens(updates: TokenUpdate[]) {
    if (updates.length === 0) return;

    const successfulUpdates = updates.filter((update) => update.status === FeedStatus.PROCESSED);
    const failedUpdates = updates.filter((update) => update.status === FeedStatus.FAILED);

    if (successfulUpdates.length > 0) {
      await Promise.all(
        successfulUpdates.map((update) =>
          this.feedRepository.update(update.id, {
            status: FeedStatus.PROCESSED,
            newPrice: update.newPrice,
          }),
        ),
      );
      this.logger.log(`Updated ${successfulUpdates.length} tokens to PROCESSED status`);
    }

    if (failedUpdates.length > 0) {
      await Promise.all(
        failedUpdates.map((update) =>
          this.feedRepository.update(update.id, {
            status: FeedStatus.FAILED,
            error: update.error,
          }),
        ),
      );
      this.logger.log(`Updated ${failedUpdates.length} tokens to FAILED status`);
    }
  }
}
