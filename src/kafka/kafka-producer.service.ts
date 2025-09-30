import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { TokenPriceUpdateMessage, tokenPriceUpdateMessageSchema } from '../models/token-price-update-message';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducerService.name);
  private producer: Producer;
  private readonly topic: string = 'token-price-updates';
  private isConnected = false;

  // NOTE: Конструктор не для асинхронной логики, выносим в отдельный метод
  async onModuleInit() {
    const kafka = new Kafka({
      clientId: 'token-price-service',
      brokers: ['localhost:9092'],
    });

    this.producer = kafka.producer();
    this.connect();
  }

  private async connect(): Promise<void> {
    await this.producer.connect();
    this.logger.log('Connected to Kafka');
  }

  async sendPriceUpdateMessage(message: TokenPriceUpdateMessage): Promise<void> {
    try {
      // Validate the message with Zod schema
      tokenPriceUpdateMessageSchema.parse(message);

      const value = JSON.stringify(message);

      // NOTE: Дожидаемся результата
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
      // Можем вернуть результат если нужно
      return;
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      // NOTE: Не отключаемся до инициализации
      if (this.producer && !this.isConnected) return;
      await this.producer.disconnect();
      this.logger.log('Disconnected from Kafka');
    } catch (error) {
      this.logger.error('Error disconnecting from Kafka', error.stack);
    }
  }
}
