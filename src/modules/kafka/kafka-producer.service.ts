import { Injectable, Inject, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Kafka, KafkaConfig, Producer, Partitioners } from 'kafkajs';
import { TokenPriceUpdateMessage, tokenPriceUpdateMessageSchema } from '../../models/token-price-update-message';
import kafkaConfig from '../../config/kafka.config';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  public static readonly topic: string = 'token-price-updates';
  private readonly logger = new Logger(KafkaProducerService.name);
  private readonly producer: Producer;
  
  constructor(
    @Inject(kafkaConfig.KEY)
    kafkaConfig: KafkaConfig,
  ) {
    const kafka = new Kafka(kafkaConfig);
    
    this.producer = kafka.producer({ createPartitioner: Partitioners.DefaultPartitioner });
  }

  async onModuleInit(): Promise<void> {
    await this.producer.connect();
    this.logger.log('Connected to Kafka');
  }

  async sendPriceUpdateMessage(message: TokenPriceUpdateMessage): Promise<boolean> {
    try {
      // Validate the message with Zod schema      
      tokenPriceUpdateMessageSchema.parse(message);
      
      const value = JSON.stringify(message);
      
      await this.producer.send({
        topic: KafkaProducerService.topic,
        messages: [
          { 
            key: message.tokenId, 
            value 
          },
        ],
      });
      
      this.logger.log(`Sent message to Kafka: ${value}`);

      return true;
    } catch (error: any) {
      this.logger.error(`Error sending message: ${error?.message}`, error?.stack);
      return false;
    }
  }
  
  async onModuleDestroy(): Promise<void> {
    this.logger.log('Disconnecting from Kafka');
    try {
      await this.producer.disconnect();
      this.logger.log('Disconnected from Kafka');
    } catch (error: any) {
      this.logger.error(`Error disconnecting from Kafka: ${error?.message}`, error.stack);
    }
  }
}
