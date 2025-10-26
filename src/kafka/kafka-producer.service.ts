import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer } from 'kafkajs';
import {
  TokenPriceUpdateMessage,
  tokenPriceUpdateMessageSchema,
} from '../models/token-price-update-message';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducerService.name);
  private producer: Producer;
  private readonly topic: string;

  constructor(private readonly configService: ConfigService) {
    const kafkaConfig = this.configService.get('kafka');

    this.topic = kafkaConfig.topic;
  }

  async onModuleInit(): Promise<void> {
    const kafkaConfig = this.configService.get('kafka');
    const kafka = new Kafka({
      clientId: kafkaConfig.clientId,
      brokers: kafkaConfig.brokers,
    });

    this.producer = kafka.producer();
    await this.connectKafka();
  }

  private async connectKafka(): Promise<void> {
    try {
      await this.producer.connect();
      this.logger.log('Connected to Kafka');
    } catch (error) {
      this.logger.error(`Error connecting to Kafka: ${error.message}`, error.stack);
      throw error;
    }
  }

  async sendPriceUpdateMessage(message: TokenPriceUpdateMessage): Promise<void> {
    // Remove try-catch to properly propagate errors
    // Add await before producer.send()
    // Validate the message with Zod schema
    tokenPriceUpdateMessageSchema.parse(message);

    const value = JSON.stringify(message);

    await this.producer.send({
      topic: this.topic,
      messages: [
        {
          key: message.tokenId,
          value,
        },
      ],
    });

    this.logger.log(`Sent message to Kafka: ${value}`);
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.producer.disconnect();
      this.logger.log('Disconnected from Kafka');
    } catch (error) {
      this.logger.error('Error disconnecting from Kafka', error.stack);
    }
  }
}
