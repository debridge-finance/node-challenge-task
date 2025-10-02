import { Injectable, Logger } from "@nestjs/common";
import { KafkaProducerService } from "../../../tools/kafka/services";
import { createTokenPriceUpdateMessage, TokenPriceUpdateMessage } from "../dto";
import { EventTopic } from "../../../types/event-bus";

@Injectable()
export class PriceNotificationService {
  private readonly logger = new Logger(PriceNotificationService.name);

  constructor(private readonly kafka: KafkaProducerService) {}

  async sendEvent(msg: TokenPriceUpdateMessage): Promise<void> {
    try {
      const message = createTokenPriceUpdateMessage(msg);
      await this.kafka.send({
        topic: EventTopic.TokenPriceUpdates,
        messages: [{ key: message.tokenId, value: JSON.stringify(message) }],
      });
    } catch (err) {
      this.logger.error(err);
    }
  }
}
