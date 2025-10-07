import { Injectable, Logger } from "@nestjs/common";
import { MessagePublisher } from "../interfaces/message-publisher.interface";
import { KafkaMessagePublisherAdapter } from "../adapters/kafka-message-publisher.adapter";

@Injectable()
export class MessagePublisherService implements MessagePublisher {
  private readonly logger = new Logger(MessagePublisherService.name);
  private readonly publisher: MessagePublisher;

  constructor(private readonly kafkaAdapter: KafkaMessagePublisherAdapter) {
    this.publisher = this.kafkaAdapter;
    this.logger.log("Using Kafka message publisher");
  }

  async publish<T = unknown>(topic: string, message: T, key?: string): Promise<void> {
    return this.publisher.publish(topic, message, key);
  }

  isConnected(): boolean {
    return this.publisher.isConnected();
  }

  async connect(): Promise<void> {
    return this.publisher.connect();
  }

  async disconnect(): Promise<void> {
    return this.publisher.disconnect();
  }
}
