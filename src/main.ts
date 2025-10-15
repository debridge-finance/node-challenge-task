import { NestFactory } from '@nestjs/core';
import { staticConfig } from '@/config';
import { Logger, LogLevel } from '@nestjs/common';
import { AppModule } from './app.module';

const levelMap: Record<string, LogLevel[]> = {
  fatal: ['fatal'],
  error: ['error'],
  warn: ['error', 'warn'],
  log: ['error', 'warn', 'log'],
  debug: ['error', 'warn', 'log', 'debug'],
  verbose: ['error', 'warn', 'log', 'debug', 'verbose'],
};

async function bootstrap() {
  const logger = new Logger('Main');
  logger.log('Starting Token Price Service...');

  try {
    const { port, logLevel } = staticConfig;
    const app = await NestFactory.create(AppModule, {
      logger: levelMap[logLevel],
    });

    await app.listen(port);
    logger.log(`Service is running on port ${port}`);
  } catch (error) {
    // Bug: Not handling exceptions properly
    logger.error(`Error: ${error.message}`);
  }
}
bootstrap();
