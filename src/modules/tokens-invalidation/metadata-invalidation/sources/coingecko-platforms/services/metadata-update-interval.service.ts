import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { InvalidateMetadataService } from "./invalidate-metadata.service";

@Injectable()
export class MetadataUpdateIntervalService implements OnModuleDestroy {
  private readonly logger = new Logger(MetadataUpdateIntervalService.name);

  private timer: NodeJS.Timeout;
  private readonly updateIntervalSeconds: number = 60;
  private isRunning: boolean = false;

  constructor(
    private readonly invalidateMetadataService: InvalidateMetadataService
  ) {}

  onModuleDestroy(): void {
    this.stop();
  }

  start(): void {
    if (this.isRunning) {
      this.logger.warn("Metadata update interval service is already running");
      return;
    }

    this.isRunning = true;
    this.logger.log(
      `Starting metadata update interval service (interval: ${this.updateIntervalSeconds} seconds)...`
    );

    this.timer = setInterval(async () => {
      try {
        await this.invalidateMetadataService.invalidateAll();
      } catch (error) {
        this.logger.error(
          `Error in metadata update interval: ${error.message}`
        );
      }
    }, this.updateIntervalSeconds * 1000);
  }

  stop(): void {
    if (!this.isRunning) {
      this.logger.warn("Metadata update interval service is not running");
      return;
    }

    clearInterval(this.timer);
    this.isRunning = false;
    this.logger.log("Metadata update interval service stopped");
  }
}
