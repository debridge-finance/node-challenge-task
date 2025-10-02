import { Logger } from "@nestjs/common";
import { Producer, ProducerRecord, RecordMetadata, Sender } from "kafkajs";
import { EventTopic } from "../../../types/event-bus";

export class KafkaProducerService implements Pick<Sender, "send"> {
  private readonly logger = new Logger(KafkaProducerService.name);

  constructor(private readonly producer: Producer) {}

  send(
    record: ProducerRecord & { topic: EventTopic }
  ): Promise<RecordMetadata[]> {
    return this.producer.send(record);
  }
}
