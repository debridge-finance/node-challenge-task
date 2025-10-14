import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TokenService } from './token.service';

@Injectable()
export class TokenCron {
  private readonly logger = new Logger(TokenCron.name);
  constructor(private readonly service: TokenService) {}

  private isRunning = false;

  @Cron(CronExpression.EVERY_5_SECONDS)
  async run(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('skip run -> isRunning');
      return;
    }
    this.isRunning = true;
    this.logger.verbose(`Starting price update...`);
    try {
      await this.service.updatePrices();
    } catch (error) {
      this.logger.error(`Error updating price: ${error.message}`);
    } finally {
      this.isRunning = false;
    }
  }
}
