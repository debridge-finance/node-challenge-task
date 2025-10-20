import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { TokenPriceInvalidationService } from "./token-price-invalidation.service";

@Injectable()
export class PriceUpdateIntervalService implements OnModuleDestroy {
  private readonly logger = new Logger(PriceUpdateIntervalService.name);

  private timer: NodeJS.Timeout;
  private readonly updateIntervalSeconds: number = 60;
  private isRunning: boolean = false;

  constructor(
    private readonly priceInvalidationService: TokenPriceInvalidationService
  ) {}

  onModuleDestroy(): void {
    this.stop();
  }

  start(): void {
    if (this.isRunning) {
      this.logger.warn("Price update interval service is already running");
      return;
    }

    this.isRunning = true;
    this.logger.log(
      `Starting price update interval service (interval: ${this.updateIntervalSeconds} seconds)...`
    );

    this.timer = setInterval(async () => {
      try {
        await this.priceInvalidationService.invalidatePrices();
      } catch (error) {
        this.logger.error(`Error in price update interval: ${error.message}`);
      }
    }, this.updateIntervalSeconds * 1000);
  }

  stop(): void {
    if (!this.isRunning) {
      this.logger.warn("Price update interval service is not running");
      return;
    }

    clearInterval(this.timer);
    this.isRunning = false;
    this.logger.log("Price update interval service stopped");
  }
}
