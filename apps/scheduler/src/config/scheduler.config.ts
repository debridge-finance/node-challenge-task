import { registerAs } from '@nestjs/config';

export const getSchedulerConfig = registerAs('scheduler', () => {
  return {
    batchSize: parseInt(process.env.BATCH_SIZE || '2', 10),
    cronExpression: process.env.PRICE_UPDATE_CRON || '*/5 * * * * *',
    enabled: process.env.PRICE_UPDATE_ENABLED === 'true',
  };
});
