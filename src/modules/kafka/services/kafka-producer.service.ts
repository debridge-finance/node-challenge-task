import { Injectable, Logger } from "@nestjs/common";
import { KafkaConnectionService } from "./kafka-connection.service";

export interface KafkaMessage<T = any> {
  topic: string;
  key?: string;
  value: T;
}

@Injectable()
export class KafkaProducerService {
  private readonly logger = new Logger(KafkaProducerService.name);

  constructor(private readonly kafkaConnection: KafkaConnectionService) {}

  async sendMessage<T>(message: KafkaMessage<T>): Promise<void> {
    try {
      const producer = this.kafkaConnection.getProducer();
      const value =
        typeof message.value === "string"
          ? message.value
          : JSON.stringify(message.value);

      await producer.send({
        topic: message.topic,
        messages: [
          {
            key: message.key,
            value,
          },
        ],
      });

      this.logger.log(
        `Sent message to Kafka topic '${message.topic}': ${value}`
      );
    } catch (error) {
      this.logger.error(
        `Error sending message to topic '${message.topic}': ${error.message}`
      );
      throw error;
    }
  }

  async sendMessages<T>(
    topic: string,
    messages: Array<{ key?: string; value: T }>
  ): Promise<void> {
    try {
      const producer = this.kafkaConnection.getProducer();
      const kafkaMessages = messages.map((msg) => ({
        key: msg.key,
        value:
          typeof msg.value === "string" ? msg.value : JSON.stringify(msg.value),
      }));

      await producer.send({
        topic,
        messages: kafkaMessages,
      });

      this.logger.log(
        `Sent ${messages.length} messages to Kafka topic '${topic}'`
      );
    } catch (error) {
      this.logger.error(
        `Error sending messages to topic '${topic}': ${error.message}`
      );
      throw error;
    }
  }
}
