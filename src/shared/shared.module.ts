import { Module } from "@nestjs/common";
import { MetricsService } from "./metrics/metrics.service";
import { MetricsController } from "./controllers/metrics.controller";

@Module({
  controllers: [MetricsController],
  providers: [
    {
      provide: "IMetricsService",
      useClass: MetricsService,
    },
  ],
  exports: ["IMetricsService"],
})
export class SharedModule {}
