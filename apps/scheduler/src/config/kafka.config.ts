import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModuleAsyncOptions, Transport } from '@nestjs/microservices';

export const getKafkaConfig = (): ClientsModuleAsyncOptions => {
  return [
    {
      name: 'TOKEN_BATCH_SERVICE',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'scheduler',
            brokers: [configService.get('KAFKA_BROKERS', 'localhost:9092')],
          },
          producerOnlyMode: true,
          producer: { allowAutoTopicCreation: true },
        },
      }),
    },
  ];
};

export const consumerConfig = {
  transport: Transport.KAFKA as const,
  options: {
    client: {
      clientId: 'price-updater-consumer',
      brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
    },
    consumer: { groupId: 'price-updater-consumer', allowAutoTopicCreation: true },
    subscribe: { fromBeginning: true },
    consumerOnlyMode: true,
  },
};
