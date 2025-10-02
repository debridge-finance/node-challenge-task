import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Main');
  logger.log('Starting Token Price Service...');
  
  try {
    const app = await NestFactory.create(AppModule);
    await app.listen(3000);
    logger.log('Service is running on port 3000');
  } catch (error) {
    // Bug: Not handling exceptions properly
    logger.error(`Error: ${error.message}`);
  }
}
bootstrap();
