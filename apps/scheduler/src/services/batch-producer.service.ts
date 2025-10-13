import { Injectable, Logger, OnModuleDestroy, Inject, OnModuleInit } from '@nestjs/common';
import { ClientProxy, KafkaRetriableException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from '../models/token.entity';
import { createTokenBatchMessage } from '../models/token-batch-message';

@Injectable()
export class BatchProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BatchProducerService.name);
  private currentOffset = 0;
  private readonly batchSize = 2;

  constructor(
    @Inject('TOKEN_BATCH_SERVICE') private readonly client: ClientProxy,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.client.connect();
      this.logger.log('Connected to microservice transport');
    } catch (error) {
      this.logger.error(`Failed to connect to microservice transport: ${error.message}`);
    }
  }

  async sendTokenBatch(): Promise<void> {
    try {
      const totalTokens = await this.tokenRepository.count();

      if (totalTokens === 0) {
        this.logger.warn('No tokens found in the database');
        return;
      }

      if (this.currentOffset >= totalTokens) {
        this.logger.log('Resetting offset to 0 after processing all tokens');
        this.currentOffset = 0;
      }

      const tokens = await this.tokenRepository.find({
        skip: this.currentOffset,
        take: this.batchSize,
      });

      if (tokens.length === 0) {
        this.logger.warn('No tokens found for the current offset');
        this.currentOffset = 0;
        return;
      }

      const batchMessage = createTokenBatchMessage({
        tokens: tokens.map((token) => ({
          id: token.id,
          symbol: token.symbol || 'UNKNOWN',
        })),
      });

      this.logger.debug(
        `Attempting to send batch with ${tokens.length} tokens (offset: ${this.currentOffset}, batchSize: ${this.batchSize}, totalTokens: ${totalTokens})`,
      );

      this.client.emit('token-batches', batchMessage).subscribe({
        next: () => {
          this.logger.log(
            `Successfully sent batch with ${tokens.length} tokens (offset: ${this.currentOffset})`,
          );
          this.currentOffset += this.batchSize;

          if (this.currentOffset >= totalTokens) {
            this.logger.log(
              'Completed processing all tokens, resetting offset to 0 for next cycle',
            );
            this.currentOffset = 0;
          }
        },
        error: (err) => {
          if (err instanceof KafkaRetriableException) {
            this.logger.warn(
              `Retriable error sending batch: ${err.message}. Will retry automatically.`,
            );
          } else {
            this.logger.error(`Error sending batch: ${err.message}`, err.stack);
          }
        },
        complete: () => {
          this.logger.debug('Batch emission completed');
        },
      });

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
