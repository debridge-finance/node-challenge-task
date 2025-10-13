import { NestFactory } from '@nestjs/core';
import { SchedulerModule } from './scheduler.module';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger('Main');
  logger.log('Starting Token Scheduler Service...');

  try {
    const app = await NestFactory.create(SchedulerModule);

    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'token-scheduler-service',
          brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
        },
        consumer: {
          groupId: 'token-scheduler-consumer',
        },
        subscribe: {
          fromBeginning: true,
        },
      },
    });

    await app.startAllMicroservices();
    await app.listen(3002);
    logger.log('Token Scheduler Service is running on port 3002');
  } catch (error) {
    logger.error(`Error: ${error.message}`);
  }
}
bootstrap();
