import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { AllExceptionsFilter, DatabaseExceptionsFilter, KafkaExceptionsFilter } from './exceptions';

async function bootstrap() {
  const logger = new Logger('Main');
  logger.log('Starting Token Scheduler Service...');

  try {
    const app = await NestFactory.create(AppModule);

    app.useGlobalFilters(
      new AllExceptionsFilter(),
      new DatabaseExceptionsFilter(),
      new KafkaExceptionsFilter(),
    );

    await app.listen(3002);
    logger.log('Token Scheduler Service is running on port 3002');
  } catch (error) {
    logger.error(`Error: ${error.message}`);
    process.exit(1);
  }
}
bootstrap();
