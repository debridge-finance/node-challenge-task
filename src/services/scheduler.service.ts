import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TokenPriceUpdateService } from './token-price-update.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private readonly tokenPriceService: TokenPriceUpdateService) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async handleCron() {
    try {
      return this.tokenPriceService.updatePrices();
    } catch (error) {
      this.logger.error(`Error updating prices: ${error.message}`);
    }
  }
}
