import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cron from 'cron';
import { TokenBatchService } from './token-batch.service';

@Injectable()
export class SchedulerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SchedulerService.name);
  private job: cron.CronJob | null = null;

  constructor(
    private readonly tokenBatchService: TokenBatchService,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    const enabled = this.configService.get<boolean>('scheduler.enabled');
    const cronExpression =
      this.configService.get<string>('scheduler.cronExpression') || '*/5 * * * * *';

    if (enabled) {
      this.setupCronJob(cronExpression);
    } else {
      this.logger.log('Price update scheduler is disabled');
    }
  }

  private setupCronJob(cronExpression: string) {
    this.job = new cron.CronJob(cronExpression, () => this.handleCron());

    this.job.start();
    this.logger.log(`Price update scheduler started with cron expression: ${cronExpression}`);
  }

  async handleCron() {
    this.logger.log('Preparing and sending token batches...');
    await this.tokenBatchService.sendTokenBatch();
  }
}
