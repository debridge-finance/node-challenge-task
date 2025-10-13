import { NestFactory } from '@nestjs/core';
import { UpdaterModule } from './updater.module';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger('Main');
  logger.log('Starting Token Updater Service...');

  try {
    const app = await NestFactory.create(UpdaterModule);

    const uniqueClientId = `token-updater-service-${Math.random().toString(36).substring(2, 10)}`;
    logger.log(`Starting with client ID: ${uniqueClientId}`);

    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: `${uniqueClientId}-server`,
          brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
        },
        consumer: {
          groupId: 'token-updater-consumer-server',
          sessionTimeout: 45000,
          heartbeatInterval: 10000,
          rebalanceTimeout: 90000,
          allowAutoTopicCreation: process.env.KAFKA_CONSUMER_ALLOW_AUTO_TOPIC_CREATION === 'true',
        },
        subscribe: {
          fromBeginning: true,
        },
      },
    });

    await app.startAllMicroservices();
    await app.listen(3001);
    logger.log('Token Updater Service is running on port 3001');
  } catch (error) {
    logger.error(`Error: ${error.message}`);
  }
}
bootstrap();
