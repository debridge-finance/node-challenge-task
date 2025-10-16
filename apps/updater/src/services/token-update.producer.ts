import { Injectable, Logger, OnModuleDestroy, Inject, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  TokenPriceUpdateMessage,
  tokenPriceUpdateMessageSchema,
} from '../models/token-price-update-message';

@Injectable()
export class TokenUpdateProducer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TokenUpdateProducer.name);

  constructor(@Inject('TOKEN_PRICE_SERVICE') private readonly client: ClientProxy) {}

  async onModuleInit(): Promise<void> {
    await this.client.connect();
  }

  async sendPriceUpdateMessage(message: TokenPriceUpdateMessage): Promise<void> {
    tokenPriceUpdateMessageSchema.parse(message);

    this.logger.debug(`Attempting to send message for token ${message.tokenId}`);
    this.client.emit('token-price-updates', message);
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.close();
  }
}
