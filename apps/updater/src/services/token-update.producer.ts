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
    try {
      await this.client.connect();
      this.logger.log('Connected to microservice transport');
    } catch (error) {
      this.logger.error(`Failed to connect to microservice transport: ${error.message}`);
    }
  }

  async sendPriceUpdateMessage(message: TokenPriceUpdateMessage): Promise<void> {
    try {
      tokenPriceUpdateMessageSchema.parse(message);

      this.logger.debug(`Attempting to send message for token ${message.tokenId}`);

      this.client.emit('token-price-updates', message);
    } catch (error) {
      this.logger.error(`Error processing message: ${error.message}`, error.stack);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      this.logger.log('Shutting down producer service...');
      await this.client.close();
      this.logger.log('Successfully disconnected from microservice transport');
    } catch (error) {
      this.logger.error('Error disconnecting from microservice transport', error.stack);
    } finally {
      this.logger.log('Producer service shutdown complete');
    }
  }
}
