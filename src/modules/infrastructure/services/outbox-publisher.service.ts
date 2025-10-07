import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { OutboxEvent } from "../entities/outbox-event.entity";
import { Inject } from "@nestjs/common";
import { MessagePublisher } from "../../messaging/interfaces/message-publisher.interface";
import { Interval } from "@nestjs/schedule";
import { DistributedLockService } from "./distributed-lock.service";
import { DISTRIBUTED_LOCK_TTL } from "../../../shared/constants/app.constants";

@Injectable()
export class OutboxPublisherService implements OnModuleDestroy {
  private readonly logger = new Logger(OutboxPublisherService.name);

  constructor(
    @InjectRepository(OutboxEvent)
    private readonly outboxRepo: Repository<OutboxEvent>,
    @Inject("MessagePublisher")
    private readonly messagePublisher: MessagePublisher,
    @Inject("IDistributedLock")
    private readonly lockService: DistributedLockService
  ) {}

  async flush(limit = 1000): Promise<void> {
    // 1) Короткая транзакция: CLAIM батч событий и вернуть их данные
    const claimedItems: Array<{ id: string; topic: string; payload: unknown }> =
      await this.outboxRepo.manager.transaction(async (tx) => {
        const rows = await tx.query(
          `
          UPDATE outbox_events AS o
          SET processing = true, claimed_at = now()
          WHERE o.id IN (
            SELECT id FROM outbox_events
            WHERE sent = false AND (processing = false OR processing IS NULL)
            ORDER BY created_at ASC
            FOR UPDATE SKIP LOCKED
            LIMIT $1
          )
          RETURNING id, topic, payload
        `,
          [limit]
        );
        return rows;
      });

    if (!claimedItems || claimedItems.length === 0) {
      return;
    }

    this.logger.debug(`Claimed ${claimedItems.length} outbox events for processing`);

    // 2) Публикуем вне транзакции; собираем успешные и неуспешные
    const successIds: string[] = [];
    const failedIds: string[] = [];

    for (const ev of claimedItems) {
      try {
        await this.messagePublisher.publish(ev.topic, ev.payload, ev.id);
        successIds.push(ev.id);
      } catch (e) {
        this.logger.error(`Failed to publish outbox ${ev.id}: ${(e as Error).message}`);
        failedIds.push(ev.id);
      }
    }

    // 3) Короткая транзакция: подтвердить успешные
    if (successIds.length > 0) {
      await this.outboxRepo.manager.transaction(async (tx) => {
        await tx.query(
          `UPDATE outbox_events SET sent = true, processing = false, sent_at = now() WHERE id = ANY($1::uuid[])`,
          [successIds]
        );
      });
      this.logger.debug(`Confirmed ${successIds.length} outbox events as sent`);
    }

    // 4) Короткая транзакция: снять processing с неуспешных
    if (failedIds.length > 0) {
      await this.outboxRepo.manager.transaction(async (tx) => {
        await tx.query(`UPDATE outbox_events SET processing = false WHERE id = ANY($1::uuid[])`, [
          failedIds,
        ]);
      });
      this.logger.debug(`Released ${failedIds.length} outbox events back to queue after failure`);
    }
  }

  /**
   * Публикуем outbox события в Kafka каждые 10 секунд
   */
  @Interval(10000) // 10 секунд
  async scheduledOutboxPublishing(): Promise<void> {
    const lockKey = "outbox-publishing-lock";
    const lockTtl = Math.floor(DISTRIBUTED_LOCK_TTL / 1000);

    // Попытка получить distributed lock
    const acquired = await this.lockService.acquireLock(lockKey, lockTtl, 0, 0);

    if (!acquired) {
      this.logger.debug("Another instance is processing outbox events, skipping this cycle");
      return;
    }

    try {
      this.logger.debug("Acquired outbox publishing lock, processing...");

      // Публикуем outbox события в Kafka
      await this.flush(1000);
    } catch (error) {
      this.logger.error(`Error in scheduled outbox publishing: ${(error as Error).message}`);
    } finally {
      // Освобождаем блокировку
      await this.lockService.releaseLock(lockKey);
    }
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log("Shutting down OutboxPublisherService...");

    // Освобождаем блокировку outbox publishing если владеем ею
    const lockKey = "outbox-publishing-lock";
    const isOwner = await this.lockService.isLockOwner(lockKey);
    if (isOwner) {
      this.logger.log("Releasing outbox publishing lock on shutdown");
      await this.lockService.releaseLock(lockKey);
    }

    this.logger.log("OutboxPublisherService shutdown completed");
  }
}
