import { Injectable, Logger, OnModuleDestroy, Inject } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Readable } from "stream";
import { fromEvent, defer, EMPTY, lastValueFrom, of } from "rxjs";
import {
  map,
  bufferCount,
  mergeMap,
  catchError,
  tap,
  takeUntil,
  finalize,
  scan,
} from "rxjs/operators";
import { Token } from "../entities/token.entity";
import { ITokenPriceRepository } from "../repositories/token-price.repository";
import { MockPriceService } from "./mock-price.service";
import { IMetricsService } from "../../../shared/interfaces/metrics-service.interface";
import { IDistributedLock } from "../../infrastructure/interfaces/distributed-lock.interface";
import { TokenStreamData } from "../interfaces/token-stream-data.interface";
import { DISTRIBUTED_LOCK_TTL } from "../../../shared/constants/app.constants";

/**
 * Сервис обновления цен токенов с поддержкой масштабирования
 * Использует streaming подход для эффективной работы с памятью
 */
@Injectable()
export class PriceUpdateService implements OnModuleDestroy {
  private readonly logger = new Logger(PriceUpdateService.name);

  private readonly BATCH_SIZE = 500; // Размер батча для обработки
  private readonly CONCURRENT_BATCHES = 4; // Параллельных батчей

  private activeStream: Readable | null = null;

  constructor(
    @InjectRepository(Token)
    private readonly tokenRepo: Repository<Token>,
    private readonly tokenPriceRepo: ITokenPriceRepository,
    private readonly priceService: MockPriceService,
    @Inject("IDistributedLock")
    private readonly lockService: IDistributedLock,
    @Inject("IMetricsService")
    private readonly metricsService: IMetricsService
  ) {}

  /**
   * Обновляет цены для всех активных токенов каждые 5 секунд
   * Использует distributed lock для предотвращения параллельных запусков
   */
  @Cron(CronExpression.EVERY_5_SECONDS)
  async scheduledPriceUpdate(): Promise<void> {
    const lockKey = "price-update-lock";
    const lockTtl = Math.floor(DISTRIBUTED_LOCK_TTL / 1000);
    const acquired = await this.lockService.acquireLock(lockKey, lockTtl);

    if (!acquired) {
      this.logger.debug("Another instance is updating prices");
      return;
    }

    try {
      this.logger.log("Starting scheduled price update with streaming...");
      await this.updateAllPricesWithStream();
    } catch (error) {
      this.logger.error(
        `Error in scheduled price update: ${(error as Error).message}`,
        (error as Error).stack
      );
    } finally {
      await this.lockService.releaseLock(lockKey);
    }
  }

  /**
   * Обновляет цены используя TypeORM stream для эффективной работы с памятью
   * Подходит для обработки миллионов токенов без OOM
   */
  async updateAllPricesWithStream(): Promise<void> {
    const startTime = Date.now();

    try {
      // Создаем streaming query - данные идут потоком, не загружаясь в память
      const queryStream = await this.tokenRepo
        .createQueryBuilder("token")
        .where("token.isActive = :isActive", { isActive: true })
        .orderBy("token.id", "ASC")
        .stream();

      this.activeStream = queryStream;

      // Создаем Observable из событий stream
      const dataObservable = fromEvent(queryStream, "data");
      const endObservable = fromEvent(queryStream, "end");
      const errorObservable = fromEvent(queryStream, "error");

      let stats = { processed: 0, updated: 0, failed: 0 };

      // Обрабатываем stream с помощью RxJS
      await lastValueFrom(
        dataObservable.pipe(
          // Останавливаем при завершении или ошибке
          takeUntil(endObservable),
          takeUntil(errorObservable),

          map((rawData: TokenStreamData) => {
            const token = new Token();
            Object.assign(token, rawData.token);
            return token;
          }),

          // Группируем в батчи по BATCH_SIZE токенов
          bufferCount(this.BATCH_SIZE),

          // Обрабатываем CONCURRENT_BATCHES батчей параллельно
          mergeMap((tokenBatch) => this.processBatch(tokenBatch), this.CONCURRENT_BATCHES),

          // Собираем статистику
          scan(
            (acc, batchResult) => ({
              processed: acc.processed + batchResult.total,
              updated: acc.updated + batchResult.updated,
              failed: acc.failed + batchResult.failed,
            }),
            stats
          ),

          // Логируем прогресс каждого батча
          tap((currentStats) => {
            stats = currentStats;
            this.logger.debug(
              `Progress: ${stats.processed} processed, ${stats.updated} updated, ${stats.failed} failed`
            );
          }),

          // Глобальная обработка ошибок stream
          catchError((error) => {
            this.logger.error(`Stream processing error: ${error.message}`, error.stack);
            return EMPTY;
          }),

          // Cleanup и финальная статистика
          finalize(() => {
            this.cleanupStream();
            const duration = Date.now() - startTime;
            this.logger.log(
              `Price update completed: ${stats.updated}/${stats.processed} tokens updated, ${stats.failed} failed in ${duration}ms`
            );

            // Метрики для мониторинга
            this.metricsService.recordPriceUpdateDuration(duration);
            this.metricsService.recordTokensProcessed(stats.processed);
            this.metricsService.recordTokensUpdated(stats.updated);
          })
        ),
        { defaultValue: stats } // Для случая пустого stream
      );
    } catch (error) {
      this.logger.error(
        `Error in updateAllPricesWithStream: ${(error as Error).message}`,
        (error as Error).stack
      );
      throw error;
    }
  }

  /**
   * Обрабатывает батч токенов
   * Возвращает статистику обработки
   */
  private processBatch(tokens: Token[]) {
    return defer(async () => {
      const batchStartTime = Date.now();
      let updated = 0;
      let failed = 0;

      // Обрабатываем токены внутри батча параллельно
      const promises = tokens.map(async (token) => {
        try {
          const wasUpdated = await this.updateSingleToken(token);
          if (wasUpdated) updated++;
        } catch (error) {
          failed++;
          this.logger.error(`Failed to update token ${token.symbol}: ${(error as Error).message}`);
        }
      });

      // Ждем завершения всех токенов в батче
      await Promise.all(promises);

      const batchDuration = Date.now() - batchStartTime;
      this.logger.debug(
        `Batch completed: ${updated}/${tokens.length} updated in ${batchDuration}ms`
      );

      return {
        updated,
        failed,
        total: tokens.length,
      };
    }).pipe(
      // Retry всего батча при критической ошибке
      catchError((error) => {
        this.logger.error(`Batch processing failed: ${error.message}`);
        return of({
          updated: 0,
          failed: tokens.length,
          total: tokens.length,
        });
      })
    );
  }

  /**
   * Обновляет цену одного токена
   * Возвращает true если цена была обновлена
   */
  private async updateSingleToken(token: Token): Promise<boolean> {
    try {
      const newPrice = await this.priceService.getPrice(token.symbol);
      const oldPrice = await this.tokenPriceRepo.findLastPrice(token.id);

      if (this.shouldUpdatePrice(oldPrice, newPrice)) {
        await this.tokenPriceRepo.savePrice(token.id, newPrice);

        this.logger.debug(`Updated price for ${token.symbol}: ${oldPrice || 0} -> ${newPrice}`);

        return true;
      }

      return false;
    } catch (error) {
      this.logger.error(`Error updating token ${token.symbol}: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Проверяет, нужно ли обновлять цену
   * Простая логика: обновляем если цена изменилась
   */
  private shouldUpdatePrice(oldPrice: number | null, newPrice: number): boolean {
    if (oldPrice === null) {
      return true; // Первая цена - всегда обновляем
    }

    return oldPrice !== newPrice; // Обновляем если цена изменилась
  }

  /**
   * Очищает ресурсы stream
   */
  private cleanupStream(): void {
    if (this.activeStream) {
      try {
        this.activeStream.destroy();
        this.activeStream = null;
      } catch (error) {
        this.logger.error(`Error destroying stream: ${(error as Error).message}`);
      }
    }
  }

  /**
   * Lifecycle hook: очистка при остановке модуля
   */
  async onModuleDestroy(): Promise<void> {
    this.logger.log("PriceUpdateService shutting down...");
    this.cleanupStream();
  }
}
