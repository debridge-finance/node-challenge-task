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
    } catch (e: any) {
      const msg = typeof e?.message === 'string' ? e.message : String(e);
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

    const { success, failed } = updates.reduce(
      (acc, u) => {
        if (u.status === FeedStatus.PROCESSED) acc.success.push(u);
        if (u.status === FeedStatus.FAILED) acc.failed.push(u);
        return acc;
      },
      { success: [] as TokenUpdate[], failed: [] as TokenUpdate[] },
    );

    const successfulUpdatesByPrice = this.groupUpdatesByProperty(success, 'newPrice');
    const failedUpdatesByError = this.groupUpdatesByProperty(failed, 'error');

    await Promise.all(
      Object.entries(successfulUpdatesByPrice).map(([price, group]) =>
        this.feedRepository.update(
          { id: In(group.map((g) => g.id)) },
          { status: FeedStatus.PROCESSED, newPrice: Number(price) },
        ),
      ),
    );

    if (success.length) this.logger.log(`Updated ${success.length} tokens to PROCESSED status`);

    await Promise.all(
      Object.entries(failedUpdatesByError).map(([error, group]) =>
        this.feedRepository.update(
          { id: In(group.map((g) => g.id)) },
          { status: FeedStatus.FAILED, error },
        ),
      ),
    );

    if (failed.length) this.logger.log(`Updated ${failed.length} tokens to FAILED status`);
  };

  groupUpdatesByProperty = <T extends keyof TokenUpdate>(
    updates: TokenUpdate[],
    property: T,
  ): Record<string, TokenUpdate[]> =>
    updates.reduce((groups, update) => {
      const key = String(update[property] ?? 'null');
      const list = groups[key] || [];
      groups[key] = [...list, update];
      return groups;
    }, {} as Record<string, TokenUpdate[]>);
}
