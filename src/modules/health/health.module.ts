import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HealthController } from "./controllers/health.controller";
import { HealthCheckService } from "./services/health-check.service";
import { MessagingModule } from "../messaging/messaging.module";
import { InfrastructureModule } from "../infrastructure/infrastructure.module";

@Module({
  imports: [TypeOrmModule, MessagingModule, InfrastructureModule],
  controllers: [HealthController],
  providers: [HealthCheckService],
  exports: [HealthCheckService],
})
export class HealthModule {}
