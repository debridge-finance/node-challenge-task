import { KafkaConfig } from 'kafkajs';

export interface KafkaProducerConfig {
  kafkaConfig: KafkaConfig;
  topic: string;
}