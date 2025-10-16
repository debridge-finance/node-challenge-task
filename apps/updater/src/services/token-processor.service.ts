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

  processSingleToken = async (token: Feed): Promise<TokenUpdate> => {
    try {
      const newPrice = await this.priceService.getRandomPriceForToken({ id: token.tokenId });
      const message = createTokenPriceUpdateMessage({
        tokenId: token.tokenId,
        symbol: token.symbol || 'UNKNOWN',
        oldPrice: token.oldPrice,
        newPrice,
      });
      await this.kafkaProducer.sendPriceUpdateMessage(message);
      this.logger.log(`Processed token ${token.tokenId} with new price ${newPrice.toFixed(2)}`);
      return { id: token.id, status: FeedStatus.PROCESSED, oldPrice: token.oldPrice, newPrice };
    } catch (e: unknown) {
      const msg = typeof (e as Error)?.message === 'string' ? (e as Error).message : String(e);
      this.logger.warn(`Error processing token ${token.tokenId}: ${msg}`);
      return { id: token.id, status: FeedStatus.FAILED, oldPrice: token.oldPrice, error: msg };
    }
  };

  processTokensBatch = async (tokens: Feed[]) => {
    if (!tokens.length) return;
    this.logger.log(`Processing ${tokens.length} tokens...`);
    const tokenIds = tokens.map((t) => t.id);
    await this.feedRepository.update({ id: In(tokenIds) }, { status: FeedStatus.PROCESSING });

    const updates = await Promise.all(tokens.map(this.processSingleToken));
    await this.batchUpdateTokens(updates);

    this.logger.log(`Completed processing batch of ${tokens.length} tokens`);
  };

  batchUpdateTokens = async (updates: TokenUpdate[]) => {
    if (!updates.length) return;

    const queries = updates.map((update) => ({
      id: update.id,
      status: update.status,
      newPrice: update.status === FeedStatus.PROCESSED ? update.newPrice : undefined,
      error: update.status === FeedStatus.FAILED ? update.error : undefined,
    }));

    await this.feedRepository.save(queries);

    const successCount = updates.filter((u) => u.status === FeedStatus.PROCESSED).length;
    const failedCount = updates.filter((u) => u.status === FeedStatus.FAILED).length;

    if (successCount) this.logger.log(`Updated ${successCount} tokens to PROCESSED status`);
    if (failedCount) this.logger.log(`Updated ${failedCount} tokens to FAILED status`);
  };
}
