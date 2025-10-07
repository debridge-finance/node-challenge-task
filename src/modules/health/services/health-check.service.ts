import { Injectable, Logger } from "@nestjs/common";
import { DataSource } from "typeorm";
import { DistributedLockService } from "../../infrastructure/services/distributed-lock.service";
import { MessagePublisherService } from "../../messaging/services/message-publisher.service";
import { HealthCheckResult } from "../../../shared/interfaces/health-check.interface";

@Injectable()
export class HealthCheckService {
  private readonly logger = new Logger(HealthCheckService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly lockService: DistributedLockService,
    private readonly messageService: MessagePublisherService
  ) {}

  /**
   * Общая проверка здоровья системы
   */
  async check(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      const results = await Promise.allSettled([
        this.checkDatabaseConnection(),
        this.checkRedisConnection(),
        this.checkKafkaConnection(),
      ]);

      const hasErrors = results.some(
        (result) =>
          result.status === "rejected" ||
          (result.status === "fulfilled" && result.value.status === "error")
      );

      const duration = Date.now() - startTime;

      return {
        status: hasErrors ? "error" : "ok",
        message: hasErrors ? "Some services are unhealthy" : "All services are healthy",
        timestamp: new Date(),
        details: {
          duration: `${duration}ms`,
          results: results.map((result, index) => ({
            service: ["database", "redis", "kafka"][index],
            status: result.status === "fulfilled" ? result.value.status : "error",
            message: result.status === "fulfilled" ? result.value.message : "Service unavailable",
          })),
        },
      };
    } catch (error) {
      this.logger.error(`Health check failed: ${(error as Error).message}`);
      return {
        status: "error",
        message: `Health check failed: ${(error as Error).message}`,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Проверка базы данных
   */
  async checkDatabaseConnection(): Promise<HealthCheckResult> {
    try {
      await this.dataSource.query("SELECT 1");
      return {
        status: "ok",
        message: "Database connection successful",
      };
    } catch (error) {
      this.logger.error(`Database health check failed: ${(error as Error).message}`);
      return {
        status: "error",
        message: `Database connection failed: ${(error as Error).message}`,
      };
    }
  }

  /**
   * Проверка Redis
   */
  async checkRedisConnection(): Promise<HealthCheckResult> {
    try {
      const testKey = "health-check";
      const acquired = await this.lockService.acquireLock(testKey, 1, 0, 0);

      if (acquired) {
        await this.lockService.releaseLock(testKey);
        return {
          status: "ok",
          message: "Redis connection successful",
        };
      }

      return {
        status: "error",
        message: "Redis lock acquisition failed",
      };
    } catch (error) {
      this.logger.error(`Redis health check failed: ${(error as Error).message}`);
      return {
        status: "error",
        message: `Redis connection failed: ${(error as Error).message}`,
      };
    }
  }

  /**
   * Проверка Kafka
   */
  async checkKafkaConnection(): Promise<HealthCheckResult> {
    try {
      // Простая проверка Kafka через message service
      const isConnected = this.messageService.isConnected();

      if (isConnected) {
        return {
          status: "ok",
          message: "Kafka connection successful",
        };
      }

      return {
        status: "error",
        message: "Kafka not connected",
      };
    } catch (error) {
      this.logger.error(`Kafka health check failed: ${(error as Error).message}`);
      return {
        status: "error",
        message: `Kafka connection failed: ${(error as Error).message}`,
      };
    }
  }
}
