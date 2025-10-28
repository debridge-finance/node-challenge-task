import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Kafka, Producer } from 'kafkajs';
import { kafkaConfig, serviceConfig } from '../../config';
import { TokenPriceUpdateMessage, tokenPriceUpdateMessageSchema } from '../../models/schemas';
import { Notifier as PriceChangeNotifier } from '../../modules/token-prices/services';

@Injectable()
export class KafkaProducerService implements PriceChangeNotifier, OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(KafkaProducerService .name);
  private kafka: Kafka;
  private readonly producer: Producer;

  constructor(
    @Inject(kafkaConfig.KEY) private kafkaConf: ConfigType<typeof kafkaConfig>,
    @Inject(serviceConfig.KEY) private serviceConf: ConfigType<typeof serviceConfig>,
  ) {
    this.kafka = new Kafka({
      clientId: kafkaConf.clientId,
      brokers: kafkaConf.brokers,
    });

    this.producer = this.kafka.producer();
  }

  async onApplicationBootstrap() {
    await this.producer.connect();
    this.logger.debug('connected to kafka');
  }

  async onApplicationShutdown() {
    try {
      await this.producer.disconnect();
      this.logger.debug('disconnected from kafka');
    } catch (err) {
      this.logger.error({ err }, 'failed to properly disconect from kafka');
    }
  }

  async notifyPriceChange(msg: TokenPriceUpdateMessage): Promise<boolean> {
    try {
      tokenPriceUpdateMessageSchema.parse(msg);
      const serialized = JSON.stringify(msg);

      await this.producer.send({
        topic: this.serviceConf.updatePriceKafkaTopic,
        acks: -1,
        messages: [
          {
            key: msg.tokenId,
            value: serialized,
          },
        ],
      });

      return true;
    } catch (err) {
      this.logger.error({ err }, 'Error sending message to kafka topic');

      return false;
    }
  }
}
