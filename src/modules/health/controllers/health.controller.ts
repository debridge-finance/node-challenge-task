import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { HealthCheckService } from "../services/health-check.service";
import {
  LivenessResponse,
  ReadinessResponse,
  HealthResponse,
  LivenessStatus,
  ReadinessStatus,
  HealthStatus,
  CheckStatus,
} from "../dto";

@Controller("health")
export class HealthController {
  constructor(private readonly healthCheckService: HealthCheckService) {}

  @Get("liveness")
  @HttpCode(HttpStatus.OK)
  async liveness(): Promise<LivenessResponse> {
    return {
      status: LivenessStatus.ALIVE,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get("readiness")
  @HttpCode(HttpStatus.OK)
  async readiness(): Promise<ReadinessResponse> {
    const healthResult = await this.healthCheckService.check();
    const results = healthResult.details?.["results"];

    return {
      status:
        healthResult.status === CheckStatus.OK ? ReadinessStatus.READY : ReadinessStatus.NOT_READY,
      timestamp: new Date().toISOString(),
      checks: Array.isArray(results) ? results : [],
    };
  }

  /**
   * Полный health check - детальная информация о состоянии всех компонентов
   * Используется для мониторинга и отладки
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async health(): Promise<HealthResponse> {
    const healthResult = await this.healthCheckService.check();
    const results = healthResult.details?.["results"];

    return {
      status:
        healthResult.status === CheckStatus.OK ? HealthStatus.HEALTHY : HealthStatus.UNHEALTHY,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: Array.isArray(results) ? results : [],
      details: healthResult.details || {},
    };
  }
}
