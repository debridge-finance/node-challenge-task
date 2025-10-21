import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer } from 'kafkajs';
import { TokenPriceUpdateMessage, tokenPriceUpdateMessageSchema } from '../models/token-price-update-message';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducerService.name);
  private readonly producer: Producer;
  private readonly topic: string;
  private isConnected: boolean = false;
  
  // use constructor to initialize the producer and topic
  constructor(private readonly configService: ConfigService) {
    const brokers = this.configService.get<string>('KAFKA_BROKERS', 'localhost:9092').split(',');
    this.topic = this.configService.get<string>('KAFKA_TOPIC', 'token-price-updates');
    
    const kafka = new Kafka({
      clientId: this.configService.get<string>('KAFKA_CLIENT_ID', 'token-price-service'),
      brokers,
    });
    
    this.producer = kafka.producer();
  }
  
  // separate async operation from constructor to avoid race conditions
  async onModuleInit(): Promise<void> {
    await this.connect();
  }
  
  private async connect(): Promise<void> {
    const maxRetries = this.configService.get<number>('KAFKA_MAX_RETRIES', 3);
    const retryDelay = this.configService.get<number>('KAFKA_RETRY_DELAY_MS', 2000);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.producer.connect();
        this.isConnected = true;
        this.logger.log('Connected to Kafka');
        return;
      } catch (error) {
        this.logger.error(`Failed to connect to Kafka (attempt ${attempt}/${maxRetries})`, error.stack);
        
        if (attempt === maxRetries) {
          throw new Error(`Failed to connect to Kafka after ${maxRetries} attempts`);
        }
        
        await this.sleep(retryDelay);
      }
    }
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  async sendPriceUpdateMessage(message: TokenPriceUpdateMessage): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Kafka producer is not connected');
    }
    
    // Validate the message with Zod schema      
    tokenPriceUpdateMessageSchema.parse(message);
    
    const maxRetries = this.configService.get<number>('KAFKA_SEND_MAX_RETRIES', 3);
    const retryDelay = this.configService.get<number>('KAFKA_SEND_RETRY_DELAY_MS', 1000);
    const value = JSON.stringify(message);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // use await here to have proper error handling and retry logic
        await this.producer.send({
          topic: this.topic,
          messages: [
            { 
              key: message.tokenId, 
              value 
            },
          ],
        });
        
        this.logger.log(`Sent message to Kafka: ${value}`);
        return;
      } catch (error) {
        this.logger.error(`Error sending message (attempt ${attempt}/${maxRetries}): ${error.message}`);
        
        if (attempt === maxRetries) {
          throw new Error(`Failed to send message to Kafka after ${maxRetries} attempts: ${error.message}`);
        }
        
        await this.sleep(retryDelay);
      }
    }
  }
  
  async onModuleDestroy(): Promise<void> {
    if (!this.isConnected) {
      return;
    }
    
    try {
      await this.producer.disconnect();
      this.isConnected = false;
      this.logger.log('Disconnected from Kafka');
    } catch (error) {
      this.logger.error('Error disconnecting from Kafka', error.stack);
    }
  }
}
