import { NestFactory } from '@nestjs/core';
import { UpdaterModule } from './updater.module';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions } from '@nestjs/microservices';
import { consumerConfig } from './config/kafka.config';

async function bootstrap() {
  const logger = new Logger('Main');
  logger.log('Starting Token Updater Service...');

  try {
    const app = await NestFactory.create(UpdaterModule);

    app.connectMicroservice<MicroserviceOptions>(consumerConfig);

    await app.startAllMicroservices();
    await app.listen(3001);
    logger.log('Token Updater Service is running on port 3001');
  } catch (error) {
    logger.error(`Error: ${error.message}`);
  }
}
bootstrap();
