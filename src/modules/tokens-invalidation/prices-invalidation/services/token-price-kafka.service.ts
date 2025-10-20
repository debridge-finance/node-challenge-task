import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { KafkaProducerService } from "../../../kafka/services/kafka-producer.service";
import { KafkaConnectionService } from "../../../kafka/services/kafka-connection.service";
import { TokenPriceUpdateMessage } from "../../../kafka/libs/types/token-price-update-message";

@Injectable()
export class TokenPriceKafkaService implements OnModuleInit {
  private readonly logger = new Logger(TokenPriceKafkaService.name);
  private readonly topic: string = "token-price-updates";

  constructor(
    private readonly kafkaProducer: KafkaProducerService,
    private readonly kafkaConnection: KafkaConnectionService
  ) {}

  async onModuleInit(): Promise<void> {
    this.logger.log(`Ensuring Kafka topic '${this.topic}' exists and is ready...`);
    await this.kafkaConnection.ensureTopicExists(this.topic);
    this.logger.log(`Kafka topic '${this.topic}' is ready`);
  }

  async sendPriceUpdate(message: TokenPriceUpdateMessage): Promise<void> {
    try {
      await this.kafkaProducer.sendMessage({
        topic: this.topic,
        key: "token" + message.tokenId,
        value: message,
      });

      this.logger.log(
        `Sent price update for token ${message.tokenId} (${message.symbol}): ${message.oldPrice} -> ${message.newPrice}`
      );
    } catch (error) {
      this.logger.error(`Error sending price update message: ${error.message}`);
      throw error;
    }
  }

  async sendPriceUpdates(messages: TokenPriceUpdateMessage[]): Promise<void> {
    try {
      await this.kafkaProducer.sendMessages(
        this.topic,
        messages.map((msg) => ({
          key: "token" + msg.tokenId,
          value: msg,
        }))
      );

      this.logger.log(`Sent ${messages.length} price updates`);
    } catch (error) {
      this.logger.error(
        `Error sending price update messages: ${error.message}`
      );
      throw error;
    }
  }
}
