import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { TokenPriceUpdateMessage, tokenPriceUpdateMessageSchema } from '../models/token-price-update-message';

@Injectable()
export class KafkaProducerService implements OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducerService.name);
  private readonly producer: Producer;
  private readonly topic: string = 'token-price-updates';
  
  constructor() {
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
      tokenPriceUpdateMessageSchema.parse(message);
      
      await this.producer.send({ // без await cообщения теряются без обработки ошибок.
        topic: this.topic,
        messages: [
          { 
            key: message.tokenId, 
            value: JSON.stringify(message),
            timestamp: Date.now().toString()
          },
        ],
      });
      
      this.logger.log(`Successfully sent message to Kafka: ${message.tokenId}`);
      
    } catch (error) {
      this.logger.error(`Failed to send message to Kafka: ${error.message}`);
      // retry логику или dead letter queue - must have сделать
      throw new Error(`Kafka send failed: ${error.message}`);
    }
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
