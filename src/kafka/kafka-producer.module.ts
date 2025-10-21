import { Module } from "@nestjs/common";
import { KafkaProducerService } from "./kafka-producer.service";

// use module to avoid circular dependencies and easier to expand in the future
@Module({
  imports: [],
  providers: [KafkaProducerService],
  exports: [KafkaProducerService],
})
export class KafkaProducerModule {}