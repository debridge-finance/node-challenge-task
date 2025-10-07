import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { OutboxEvent } from "../entities/outbox-event.entity";

/**
 * Сервис для работы с outbox событиями
 */
@Injectable()
export class OutboxService {
  constructor(
    @InjectRepository(OutboxEvent)
    private readonly outboxRepo: Repository<OutboxEvent>
  ) {}

  /**
   * Создает outbox событие для последующей публикации
   */
  async createEvent(topic: string, payload: Record<string, unknown>): Promise<OutboxEvent> {
    const outboxEvent = this.outboxRepo.create({
      topic,
      payload,
    });

    return await this.outboxRepo.save(outboxEvent);
  }
}
