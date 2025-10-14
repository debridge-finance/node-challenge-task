import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TokenBatchProducer } from './token-batch.producer';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private readonly batchProducerService: TokenBatchProducer) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async handleCron() {
    try {
      this.logger.log('Sending token batch...');
      return this.batchProducerService.sendTokenBatch();
    } catch (error) {
      this.logger.error(`Error sending token batch: ${error.message}`);
    }
  }
}
