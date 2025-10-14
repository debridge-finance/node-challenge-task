import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModuleAsyncOptions, Transport } from '@nestjs/microservices';

export const getKafkaConfig = (): ClientsModuleAsyncOptions => {
  return [
    {
      name: 'TOKEN_PRICE_SERVICE',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: `token-updater-client`,
            brokers: [configService.get('KAFKA_BROKERS', 'localhost:9092')],
          },
          consumer: {
            groupId: 'token-updater-consumer-client',
            sessionTimeout: 45000,
            heartbeatInterval: 10000,
            rebalanceTimeout: 90000,
            allowAutoTopicCreation:
              configService.get('KAFKA_CONSUMER_ALLOW_AUTO_TOPIC_CREATION', 'true') === 'true',
          },
          producer: { allowAutoTopicCreation: true },
          subscribe: {
            fromBeginning: true,
          },
        },
      }),
    },
  ];
};
