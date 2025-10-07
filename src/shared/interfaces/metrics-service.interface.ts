/**
 * Интерфейс для сервиса метрик
 * Определяет минимальный контракт для взаимодействия с системой метрик
 */
export interface IMetricsService {
  /**
   * Увеличивает счетчик полученных distributed locks
   */
  incrementDistributedLocksAcquired(lockName: string): void;

  /**
   * Увеличивает счетчик освобожденных distributed locks
   */
  incrementDistributedLocksReleased(lockName: string): void;

  /**
   * Увеличивает счетчик ошибок distributed locks
   */
  incrementDistributedLockFailures(lockName: string, reason: string): void;

  /**
   * Записывает длительность обновления цен
   */
  recordPriceUpdateDuration(durationMs: number): void;

  /**
   * Записывает количество обработанных токенов
   */
  recordTokensProcessed(count: number): void;

  /**
   * Записывает количество обновленных токенов
   */
  recordTokensUpdated(count: number): void;

  /**
   * Получает метрики в формате Prometheus
   */
  getMetrics(): Promise<string>;
}
