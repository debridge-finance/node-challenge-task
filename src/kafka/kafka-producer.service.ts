import { Injectable, Logger, OnModuleDestroy, Inject } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { TokenPriceUpdateMessage, tokenPriceUpdateMessageSchema } from '../models/token-price-update-message';
import { INJECT_TOKENS } from '../utils/injectTokens';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { PriceUpdateMessageDto } from './dto/kafka-message.dto';
import { KafkaProducerConfig } from './types';

@Injectable()
export class KafkaProducerService implements OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducerService.name);
  private readonly producer: Producer;
  private readonly topic: string;
  private isConnected = false;
  private connectionPromise: Promise<void> | null = null;
  
  constructor(@Inject(INJECT_TOKENS.KAFKA_PRODUCER_CONFIG) config: KafkaProducerConfig) {
    const kafka = new Kafka(config.kafkaConfig);
    this.topic = config.topic;
    this.producer = kafka.producer({
      retry: {
        initialRetryTime: 100,
        retries: 5,
      },
    });
    this.connectionPromise = this.connect();
  }
  
  private async connect(): Promise<void> {
    try {
      await this.producer.connect();
      this.isConnected = true;
      this.logger.log('Connected to Kafka');
    } catch (error) {
      this.logger.error('Failed to connect to Kafka', error.stack);
      // Don't rethrow - just log the error and keep isConnected false
      // The error will be thrown when trying to send a message
    }
  }
  
  private async ensureConnected(): Promise<void> {
    if (this.connectionPromise) {
      await this.connectionPromise;
      this.connectionPromise = null;
    }
    
    if (!this.isConnected) {
      throw new Error('Kafka producer is not connected');
    }
  }
  
  async sendPriceUpdateMessage(message: TokenPriceUpdateMessage): Promise<void> {
    try {
      // Ensure we're connected before sending
      await this.ensureConnected();
      
      // Convert to DTO and validate
      const messageDto = plainToInstance(PriceUpdateMessageDto, message);
      await validateOrReject(messageDto);
      
      // Also validate with Zod schema for backwards compatibility
      tokenPriceUpdateMessageSchema.parse(message);
      
      const value = JSON.stringify(message);
      
      // Wait for the message to be sent
      const result = await this.producer.send({
        topic: this.topic,
        messages: [
          { 
            key: message.tokenId, 
            value,
            timestamp: Date.now().toString(),
          },
        ],
      });
      
      this.logger.log(`Sent message to Kafka: ${value}`);
      this.logger.debug(`Send result: ${JSON.stringify(result)}`);
    } catch (error) {
      this.logger.error(`Failed to send message to Kafka: ${error.message}`, error.stack);
      // Re-throw the error so the caller knows the operation failed
      throw error;
    }
  }
  
  async onModuleDestroy(): Promise<void> {
    try {
      if (this.isConnected) {
        await this.producer.disconnect();
        this.isConnected = false;
        this.logger.log('Disconnected from Kafka');
      }
    } catch (error) {
      this.logger.error('Error disconnecting from Kafka', error.stack);
    }
  }
}
