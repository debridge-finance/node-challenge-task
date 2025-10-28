import {
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { BigNumber } from 'bignumber.js';
import { DataSource, Repository } from 'typeorm';
import { Notifier, PriceService } from './services';
import { PriceChangeNotifier, TokensPriceService } from './tokens';
import {
  Chain,
  Price,
  Token,
} from '../../models/entities';
import { createTokenPriceUpdateMessage } from '../../models/schemas';

@Injectable()
export class TokenUpdatePricesService {
  private logger = new Logger(TokenUpdatePricesService.name);
  private readonly tokenRepo: Repository<Token>;
  private readonly chainRepo: Repository<Chain>;

  constructor(
    private readonly dataSource: DataSource,
    @Inject(TokensPriceService) private readonly priceFetcher: PriceService,
    @Inject(PriceChangeNotifier) private readonly notifier: Notifier,
  ) {
    this.tokenRepo = this.dataSource.getRepository(Token);
    this.chainRepo = this.dataSource.getRepository(Chain);
  }

  async updatePriceFor(tokenId: string): Promise<{ success: boolean, reason: string }> {
    const token = await this.tokenRepo.findOne({
      select: {
        id: true,
        address: true,
        symbol: true,
      },
      where: { id: tokenId },
    });
    if (!token) {
      return { success: false, reason: 'Token not found' };
    }

    const chain = await this.chainRepo.findOne({
      select: {
        name: true,
        isEnabled: true,
        deId: true,
      },
      where: { id: token.chainId },
    });
    if (!chain) {
      return {  success: false, reason: 'Chain not found for token' };
    }
    if (!chain.isEnabled) {
      return { success: false, reason: 'Chain for this token is disabled' };
    }

    const freshPrice = await this.priceFetcher.fetchLatestForToken(
      token.address,
      chain.deId,
      chain.name,
    );
    const res = await this.dataSource.transaction(async (manager) => {
      const currentP = await manager
        .getRepository(Price)
        .findOne({
          lock: { mode: 'pessimistic_write' },
          where: { tokenId: token.id },
        });

      if (currentP && currentP.price === freshPrice) {
        return;
      }

      const updateTime = new Date();
      const changeMsg = createTokenPriceUpdateMessage({
        tokenId: token.id,
        symbol: token.symbol ?? 'UNKNOWN',
        oldPrice: currentP?.price ? BigNumber(currentP.price).toNumber() : 0,
        newPrice: BigNumber(freshPrice).toNumber(),
        timestamp: updateTime,
      });

      const newP = new Price();
      if (currentP) {
        newP.id = currentP.id;
        newP.createdAt = currentP.createdAt;
      } else {
        newP.createdAt = updateTime;
      }
      newP.tokenId = token.id;
      newP.price = freshPrice;
      newP.createdAt = updateTime;
      newP.updatedAt = updateTime;

      await manager.getRepository(Price).save(newP);

      const broadcasted = await this.notifier.notifyPriceChange(changeMsg);
      if (!broadcasted) {
        throw new Error('Failed to broadcast price change');
      }

      return {
        updated: newP,
        old: currentP,
      };
    });

    if (!res) {
      return { success: true, reason: 'Price is up-to-date' };
    }

    this.logger.debug(`Updated price for ${token.symbol}: ${res.old?.price} -> ${res.updated.price}`);

    return { success: true, reason: '' };
  }
}
