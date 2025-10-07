import { Module } from "@nestjs/common";
import { MessagePublisherService } from "./services/message-publisher.service";
import { KafkaMessagePublisherAdapter } from "./adapters/kafka-message-publisher.adapter";

@Module({
  providers: [
    {
      provide: "MessagePublisher",
      useClass: MessagePublisherService,
    },
    KafkaMessagePublisherAdapter,
  ],
  exports: ["MessagePublisher"],
})
export class MessagingModule {}
