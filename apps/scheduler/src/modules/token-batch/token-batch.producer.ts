import { Injectable, OnModuleDestroy, Inject, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { TokenBatchMessage } from '../../models/token-batch-message';

@Injectable()
export class TokenBatchProducer implements OnModuleInit, OnModuleDestroy {
  constructor(@Inject('TOKEN_BATCH_SERVICE') private readonly client: ClientProxy) {}

  async onModuleInit(): Promise<void> {
    await this.client.connect();
  }

  public async sendMessage(message: TokenBatchMessage) {
    this.client.emit('token-batches', message);
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.close();
  }
}
