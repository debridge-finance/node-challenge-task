import { Controller, Get, Header, HttpCode, HttpStatus, Inject } from "@nestjs/common";
import { IMetricsService } from "../interfaces/metrics-service.interface";

@Controller("metrics")
export class MetricsController {
  constructor(@Inject("IMetricsService") private readonly metricsService: IMetricsService) {}

  @Get("prometheus")
  @HttpCode(HttpStatus.OK)
  @Header("Content-Type", "text/plain; version=0.0.4; charset=utf-8")
  async getPrometheusMetrics(): Promise<string> {
    return this.metricsService.getMetrics();
  }
}
