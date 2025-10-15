import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions } from '@nestjs/microservices';
import { consumerConfig } from './config/kafka.config';

async function bootstrap() {
  const logger = new Logger('Main');
  logger.log('Starting Token Scheduler Service...');

  try {
    const app = await NestFactory.create(AppModule);

    app.connectMicroservice<MicroserviceOptions>(consumerConfig);

    await app.startAllMicroservices();
    await app.listen(3002);
    logger.log('Token Scheduler Service is running on port 3002');
  } catch (error) {
    logger.error(`Error: ${error.message}`);
  }
}
bootstrap();
