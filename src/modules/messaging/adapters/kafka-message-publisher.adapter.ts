import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Kafka, Producer, logLevel } from "kafkajs";
import { MessagePublisher, MessagingConfig } from "../interfaces/message-publisher.interface";
import { getRequiredConfig } from "../../../shared/utils/config.utils";

@Injectable()
export class KafkaMessagePublisherAdapter implements MessagePublisher {
  private readonly logger = new Logger(KafkaMessagePublisherAdapter.name);
  private readonly kafka: Kafka;
  private readonly producer: Producer;
  private readonly config: MessagingConfig;
  private connected = false;

  constructor(private readonly configService: ConfigService) {
    this.config = getRequiredConfig<MessagingConfig>(this.configService, "messaging");

    this.kafka = new Kafka({
      clientId: this.config.connection.clientId || "token-price-service",
      brokers: this.config.connection.brokers || ["localhost:9092"],
      logLevel: logLevel.INFO,
    });

    this.producer = this.kafka.producer({
      allowAutoTopicCreation: true,
      retry: {
        retries: this.config.options?.retries || 3,
      },
    });
  }

  async publish<T = unknown>(topic: string, message: T, key?: string): Promise<void> {
    if (!this.connected) {
      await this.connect();
    }

    try {
      await this.producer.send({
        topic,
        messages: [
          {
            key: key || null,
            value: JSON.stringify(message),
            timestamp: Date.now().toString(),
          },
        ],
        acks: -1,
      });

      this.logger.debug(`Message published to topic ${topic}:`, {
        key,
        message,
      });
    } catch (error) {
      this.logger.error(`Failed to publish message to ${topic}:`, error);
      throw error;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  async connect(): Promise<void> {
    if (this.connected) return;

    try {
      await this.producer.connect();
      this.connected = true;
      this.logger.log("Connected to Kafka");
    } catch (error) {
      this.logger.error(`Failed to connect to Kafka: ${error.message}`);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connected) return;

    try {
      await this.producer.disconnect();
      this.connected = false;
      this.logger.log("Disconnected from Kafka");
    } catch (error) {
      this.logger.error(`Error disconnecting from Kafka: ${error.message}`);
    }
  }
}
