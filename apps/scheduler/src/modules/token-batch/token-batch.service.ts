import { Injectable, Logger } from '@nestjs/common';
import { setImmediate } from 'timers/promises';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Token } from '../../models/token.entity';
import { createTokenBatchMessage } from '../../models/token-batch-message';
import { TokenBatchProducer } from './token-batch.producer';

@Injectable()
export class TokenBatchService {
  private readonly logger = new Logger(TokenBatchService.name);
  private readonly batchSize: number;

  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    private readonly configService: ConfigService,
    private readonly tokenBatchProducer: TokenBatchProducer,
  ) {
    this.batchSize = this.configService.get<number>('scheduler.batchSize', 2);
  }

  private async fetchAndSendBatch(batchIndex: number, batchCount: number): Promise<number> {
    const tokens = await this.tokenRepository.find({
      skip: batchIndex * this.batchSize,
      take: this.batchSize,
    });

    if (tokens.length === 0) {
      this.logger.warn(`No tokens found for batch ${batchIndex + 1}`);
      return 0;
    }

    const batchMessage = createTokenBatchMessage({
      tokens: tokens.map((token) => ({
        id: token.id,
        symbol: token.symbol || 'UNKNOWN',
        oldPrice: Number(token.price) || 0,
      })),
    });

    this.logger.debug(
      `Preparing batch ${batchIndex + 1}/${batchCount} with ${tokens.length} tokens`,
    );

    this.tokenBatchProducer.sendMessage(batchMessage);
    this.logger.log(
      `Successfully sent batch ${batchIndex + 1}/${batchCount} with ${tokens.length} tokens`,
    );

    return tokens.length;
  }

  async sendTokenBatch(): Promise<void> {
    const totalTokens = await this.tokenRepository.count();

    if (totalTokens === 0) {
      return this.logger.warn('No tokens found in the database');
    }

    this.logger.log(`Processing ${totalTokens} tokens in batches of ${this.batchSize}`);

    const batchCount = Math.ceil(totalTokens / this.batchSize);
    this.logger.log(`Will send ${batchCount} batches in this cycle`);

    let processedTokens = 0;

    for (let batchIndex = 0; batchIndex < batchCount; batchIndex++) {
      const tokensProcessed = await this.fetchAndSendBatch(batchIndex, batchCount);
      processedTokens += tokensProcessed;

      this.logger.debug(
        `Batch ${
          batchIndex + 1
        }/${batchCount} processing completed (${processedTokens}/${totalTokens} tokens processed)`,
      );

      if (batchIndex < batchCount - 1) {
        this.logger.debug('Resetting event loop to free memory with setImmediate');
        await setImmediate();
      }
    }

    this.logger.log(
      `Completed sending all ${batchCount} batches (${processedTokens}/${totalTokens} tokens processed)`,
    );
  }
}
