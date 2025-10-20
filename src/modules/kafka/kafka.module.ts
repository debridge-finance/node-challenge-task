import { Module } from "@nestjs/common";
import { KafkaConnectionService } from "./services/kafka-connection.service";
import { KafkaProducerService } from "./services/kafka-producer.service";

@Module({
  providers: [KafkaConnectionService, KafkaProducerService],
  exports: [KafkaConnectionService, KafkaProducerService],
})
export class KafkaModule {}
