import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

// NOTE: Что можно улучшить
// 1. Вынести конфигурацию в ConfigService
// 2. Использовать @nestjs/schedule для job вместо setInterval
// 3. Использовать BigNumber или BigInt для работы с ценами
// 4. Необходим аудит пакетов NPM

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
