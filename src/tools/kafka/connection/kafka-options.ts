import {KafkaConfig} from "kafkajs";


export function kafkaOptions(): KafkaConfig {
  return {
    clientId: 'token-price-service',
    brokers: ['localhost:9092'],
  };
}