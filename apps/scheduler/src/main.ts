import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Main');
  logger.log('Starting Token Scheduler Service...');

  try {
    const app = await NestFactory.create(AppModule);

    await app.listen(3002);
    logger.log('Token Scheduler Service is running on port 3002');
  } catch (error) {
    logger.error(`Error: ${error.message}`);
  }
}
bootstrap();
