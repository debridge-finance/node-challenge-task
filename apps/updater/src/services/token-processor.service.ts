import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feed, FeedStatus } from '../models/feed.entity';
import { MockPriceProvider } from './mock-price.provider';
import { ProducerService } from './producer.service';
import { createTokenPriceUpdateMessage } from '../models/token-price-update-message';

@Injectable()
export class TokenProcessorService {
  private readonly logger = new Logger(TokenProcessorService.name);
  private readonly instanceId = Math.random().toString(36).substring(2, 10);

  constructor(
    @InjectRepository(Feed)
    private readonly feedRepository: Repository<Feed>,
    private readonly priceService: MockPriceProvider,
    private readonly kafkaProducer: ProducerService,
  ) {
    this.logger.log(`TokenProcessorService initialized with instance ID: ${this.instanceId}`);
  }

  async processTokensBatch(tokens: Feed[]) {
    if (tokens.length === 0) {
      return;
    }

    this.logger.log(`[Instance ${this.instanceId}] Processing ${tokens.length} tokens...`);
    await Promise.all(
      tokens.map((token) =>
        this.feedRepository.update(token.id, { status: FeedStatus.PROCESSING }),
      ),
    );

    for (const token of tokens) {
      await this.processToken(token);
    }

    this.logger.log(
      `[Instance ${this.instanceId}] Completed processing batch of ${tokens.length} tokens`,
    );
  }

  private async processToken(feed: Feed) {
    try {
      const newPrice = await this.priceService.getRandomPriceForToken({ id: feed.tokenId });

      const message = createTokenPriceUpdateMessage({
        tokenId: feed.tokenId,
        symbol: feed.symbol || 'UNKNOWN',
        oldPrice: typeof feed.oldPrice === 'string' ? parseFloat(feed.oldPrice) : (Number(feed.oldPrice) || 0),
        newPrice,
      });
      await this.kafkaProducer.sendPriceUpdateMessage(message);
      await this.feedRepository.update(feed.id, { status: FeedStatus.PROCESSED, newPrice });

      this.logger.log(
        `[Instance ${this.instanceId}] Processed token ${feed.tokenId} with new price ${newPrice.toFixed(2)}`,
      );
    } catch (error) {
      this.logger.error(
        `[Instance ${this.instanceId}] Error processing token ${feed.tokenId}: ${error.message}`,
      );

      await this.feedRepository.update(feed.id, {
        status: FeedStatus.FAILED,
        error: error.message,
      });
    }
  }
}
