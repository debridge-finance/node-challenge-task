import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
    private readonly config: ConfigService,
    private readonly priceService: PriceService,
    private readonly kafkaProducer: KafkaService,
  ) {}

  private get batchSize(): number {
    return this.config.getOrThrow<number>('contracts.multicallBatchSize');
  }

  private async getAllChainIds(): Promise<string[]> {
    const rows = await this.tokenRepository
      .createQueryBuilder('t')
      .select('DISTINCT t.chainId', 'chainId')
      .orderBy('t.chainId', 'ASC')
      .getRawMany<{ chainId: string }>();

    return rows.map((r) => r.chainId);
  }

  private async *iterateTokensInBatches(
    chainId: string,
    batchSize = this.batchSize,
  ) {
    let lastId: string | null = null;

    while (true) {
      const qb = this.tokenRepository
        .createQueryBuilder('t')
        .where('t.chainId = :chainId', { chainId })
        .orderBy('t.id', 'ASC')
        .take(batchSize);

      if (lastId) {
        qb.andWhere('t.id > :lastId', { lastId });
      }

      const batch = await qb.getMany();
      if (batch.length === 0) return;

      yield batch;
      lastId = batch[batch.length - 1]!.id;
    }
  }

  public async updatePrices(): Promise<void> {
    try {
      const chainIds = await this.getAllChainIds();

      // !: If this scales to many chains, it may overwhelm Kafka and the DB.
      // Consider a concurrency limiter (e.g., a semaphore) to cap parallel chains.
      const promises = chainIds.map(async (chainId) => {
        let processed = 0;
        for await (const batch of this.iterateTokensInBatches(chainId)) {
          await this.updateTokensPrices(chainId, batch);
          processed += batch.length;
        }
        return processed;
      });
      const results = await Promise.allSettled(promises);

      let total = 0;
      results.forEach((result, i) => {
        const chainId = chainIds[i]!;
        if (result.status === 'rejected') {
          this.logger.error(
            {
              err: result.reason,
              chainId,
            },
            'Prices update for the chain has failed.',
          );
        } else {
          total += result.value;
        }
      });

      this.logger.verbose(`Prices updated for ~${total} tokens (batched).`);
    } catch (error) {
      this.logger.error(`Error updating prices: ${error.message}`);
    }
  }

  private async updateTokensPrices(
    chainId: string,
    tokens: TokenEntity[],
  ): Promise<void> {
    try {
      const newPrices = await this.priceService.getPricesForTokens(
        chainId,
        tokens,
      );
      const promises = tokens.map((t, i) => {
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
          t.lastPriceUpdate = new Date(); // ?: Or, we could just use @UpdateDateColumn

          await tokenRepo.save(t);
          this.logger.log(
            `Updated price for ${t.symbol}: ${oldPrice} -> ${newPrice}`,
          );
          // After save to DB
          // !: it is still better to use outbox, because of potential out of sync: rollback, deadlock, etc.
          await this.kafkaProducer.sendPriceUpdateMessage(message);
        });
      });
      const results = await Promise.allSettled(promises);
      results.forEach((result, i) => {
        const token = tokens[i]!;
        if (result.status === 'rejected') {
          this.logger.error(
            {
              err: result.reason,
              chainId: token.chainId,
              token: token.address,
            },
            'Price update for the token has failed.',
          );
        }
      });
    } catch (error) {
      this.logger.error(`Error updating prices for tokens: ${error.message}`);
    }
  }
}
