import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";
import { RedisConfigOptions } from "../../../shared/config/redis.config";
import { Inject } from "@nestjs/common";
import { IMetricsService } from "../../../shared/interfaces/metrics-service.interface";
import { getRequiredConfig } from "../../../shared/utils/config.utils";

@Injectable()
export class DistributedLockService implements OnModuleDestroy {
  private readonly logger = new Logger(DistributedLockService.name);
  private readonly redis: Redis;
  private readonly instanceId: string;

  constructor(
    private configService: ConfigService,
    @Inject("IMetricsService") private metricsService: IMetricsService
  ) {
    this.instanceId = `${process.pid}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const redisConfig = getRequiredConfig<RedisConfigOptions>(this.configService, "redis");

    const redisOptions: Record<string, unknown> = {
      host: redisConfig.host,
      port: redisConfig.port,
      db: redisConfig.db,
      maxRetriesPerRequest: redisConfig.maxRetriesPerRequest,
      lazyConnect: true,
    };

    if (redisConfig["password"]) {
      redisOptions["password"] = redisConfig["password"];
    }

    this.redis = new Redis(redisOptions);

    this.logger.log(`DistributedLockService initialized with instance ID: ${this.instanceId}`);
  }

  /**
   * Попытка получить блокировку
   * @param key - ключ блокировки
   * @param ttl - время жизни блокировки в секундах
   * @param retryDelay - задержка между попытками в мс
   * @param maxRetries - максимальное количество попыток
   */
  async acquireLock(key: string, ttl: number, retryDelay = 0, maxRetries = 0): Promise<boolean> {
    const lockKey = `lock:${key}`;
    const lockValue = this.instanceId;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.redis.set(lockKey, lockValue, "PX", ttl * 1000, "NX");

        if (result === "OK") {
          this.logger.debug(`Acquired lock: ${key} (attempt ${attempt + 1})`);
          this.metricsService.incrementDistributedLocksAcquired(key);
          return true;
        }

        if (attempt < maxRetries) {
          this.logger.debug(
            `Lock ${key} is busy, retrying in ${retryDelay}ms (attempt ${attempt + 1}/${
              maxRetries + 1
            })`
          );
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
      } catch (error) {
        this.logger.error(`Error acquiring lock ${key}: ${(error as Error).message}`);
        this.metricsService.incrementDistributedLockFailures(key, "acquire_error");
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
      }
    }

    this.logger.debug(`Failed to acquire lock: ${key} after ${maxRetries + 1} attempts`);
    return false;
  }

  /**
   * Освобождение блокировки
   * @param key - ключ блокировки
   */
  async releaseLock(key: string): Promise<boolean> {
    const lockKey = `lock:${key}`;

    try {
      // Используем Lua скрипт для атомарной проверки и удаления
      const luaScript = `
        if redis.call("GET", KEYS[1]) == ARGV[1] then
          return redis.call("DEL", KEYS[1])
        else
          return 0
        end
      `;

      const result = await this.redis.eval(luaScript, 1, lockKey, this.instanceId);

      if (result === 1) {
        this.logger.debug(`Released lock: ${key}`);
        this.metricsService.incrementDistributedLocksReleased(key);
        return true;
      } else {
        this.logger.debug(`Lock ${key} is not owned by this instance`);
        return false;
      }
    } catch (error) {
      this.logger.error(`Error releasing lock ${key}: ${(error as Error).message}`);
      return false;
    }
  }

  /**
   * Проверка, владеет ли текущий экземпляр блокировкой
   * @param key - ключ блокировки
   */
  async isLockOwner(key: string): Promise<boolean> {
    const lockKey = `lock:${key}`;

    try {
      const value = await this.redis.get(lockKey);
      return value?.startsWith(this.instanceId) || false;
    } catch (error) {
      this.logger.error(`Error checking lock ownership ${key}: ${(error as Error).message}`);
      return false;
    }
  }

  /**
   * Обновление TTL блокировки
   * @param key - ключ блокировки
   * @param ttl - новое время жизни в секундах
   */
  async refreshLock(key: string, ttl: number): Promise<boolean> {
    const lockKey = `lock:${key}`;

    try {
      // Используем Lua скрипт для атомарной проверки и обновления TTL
      const luaScript = `
        if redis.call("GET", KEYS[1]) == ARGV[1] then
          return redis.call("PEXPIRE", KEYS[1], ARGV[2])
        else
          return 0
        end
      `;

      const result = await this.redis.eval(luaScript, 1, lockKey, this.instanceId, ttl * 1000);

      if (result === 1) {
        this.logger.debug(`Refreshed lock: ${key} (TTL: ${ttl}s)`);
        return true;
      } else {
        this.logger.debug(`Lock ${key} is not owned by this instance`);
        return false;
      }
    } catch (error) {
      this.logger.error(`Error refreshing lock ${key}: ${(error as Error).message}`);
      return false;
    }
  }

  /**
   * Освобождение всех блокировок текущего экземпляра
   */
  async releaseAllLocks(): Promise<void> {
    try {
      const keys = await this.redis.keys("lock:*");
      const ownedKeys = [];

      for (const key of keys) {
        const value = await this.redis.get(key);
        if (value?.startsWith(this.instanceId)) {
          ownedKeys.push(key);
        }
      }

      if (ownedKeys.length > 0) {
        this.logger.log(`Releasing ${ownedKeys.length} locks on shutdown: ${ownedKeys.join(", ")}`);
        await Promise.all(ownedKeys.map((key) => this.redis.del(key)));
      }
    } catch (error) {
      this.logger.error(`Error releasing locks on shutdown: ${(error as Error).message}`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log("DistributedLockService shutting down...");

    try {
      // Освобождаем все блокировки перед отключением от Redis
      await this.releaseAllLocks();

      // Закрываем соединение с Redis
      await this.redis.quit();
      this.logger.log("Disconnected from Redis");
    } catch (error) {
      this.logger.error(`Error disconnecting from Redis: ${(error as Error).message}`);
    }
  }
}
