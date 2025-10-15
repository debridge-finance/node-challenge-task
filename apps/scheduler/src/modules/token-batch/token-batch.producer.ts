import { Injectable, Logger, OnModuleDestroy, Inject, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { TokenBatchMessage } from '../../models/token-batch-message';

@Injectable()
export class TokenBatchProducer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TokenBatchProducer.name);

  constructor(@Inject('TOKEN_BATCH_SERVICE') private readonly client: ClientProxy) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.client.connect();
      this.logger.log('Connected to microservice transport');
    } catch (error) {
      this.logger.error(`Failed to connect to microservice transport: ${error.message}`);
    }
  }

  public async sendMessage(message: TokenBatchMessage) {
    this.client.emit('token-batches', message);
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
