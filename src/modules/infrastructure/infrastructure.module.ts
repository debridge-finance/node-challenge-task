import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OutboxEvent } from "./entities/outbox-event.entity";
import { DistributedLockService } from "./services/distributed-lock.service";
import { OutboxService } from "./services/outbox.service";
import { OutboxPublisherService } from "./services/outbox-publisher.service";
import { MessagingModule } from "../messaging/messaging.module";
import { SharedModule } from "../../shared/shared.module";

@Module({
  imports: [TypeOrmModule.forFeature([OutboxEvent]), MessagingModule, SharedModule],
  providers: [
    {
      provide: "IDistributedLock",
      useClass: DistributedLockService,
    },
    OutboxService,
    OutboxPublisherService,
  ],
  exports: ["IDistributedLock", OutboxService],
})
export class InfrastructureModule {}
