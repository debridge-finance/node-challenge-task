import { Injectable, Logger, OnModuleDestroy, Inject, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { setImmediate } from 'timers/promises';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Token } from '../../models/token.entity';
import { createTokenBatchMessage } from '../../models/token-batch-message';
import { TokenBatchProducer } from './token-batch.producer';

@Injectable()
export class TokenBatchService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TokenBatchService.name);
  private readonly batchSize: number;

  constructor(
    @Inject('TOKEN_BATCH_SERVICE') private readonly client: ClientProxy,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    private readonly configService: ConfigService,
    private readonly tokenBatchProducer: TokenBatchProducer,
  ) {
    this.batchSize = this.configService.get<number>('scheduler.batchSize', 2);
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.client.connect();
      this.logger.log('Connected to microservice transport');
    } catch (error) {
      this.logger.error(`Failed to connect to microservice transport: ${error.message}`);
    }
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

    try {
      this.tokenBatchProducer.sendMessage(batchMessage);
      this.logger.log(
        `Successfully sent batch ${batchIndex + 1}/${batchCount} with ${tokens.length} tokens`,
      );

      return tokens.length;
    } catch (err) {
      this.logger.error(
        `Error sending batch ${batchIndex + 1}/${batchCount}: ${err.message}`,
        err.stack,
      );
      throw err;
    }
  }

  async sendTokenBatch(): Promise<void> {
    try {
      const totalTokens = await this.tokenRepository.count();

      if (totalTokens === 0) {
        this.logger.warn('No tokens found in the database');
        return;
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
      return;
    } catch (error) {
      this.logger.error(`Error processing batch: ${error.message}`, error.stack);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      this.logger.log('Shutting down batch producer service...');
      await this.client.close();
      this.logger.log('Successfully disconnected from microservice transport');
    } catch (error) {
      this.logger.error('Error disconnecting from microservice transport', error.stack);
    } finally {
      this.logger.log('Batch producer service shutdown complete');
    }
  }
}
