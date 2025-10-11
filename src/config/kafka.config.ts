import { KafkaConfig } from "kafkajs";
import { registerAs } from "@nestjs/config";

export const getKafkaConfig = (): KafkaConfig => ({
  clientId: process.env.KAFKA_CLIENT_ID ?? "token-price-service",
  brokers: (process.env.KAFKA_BROKERS ?? "localhost:9092").split(","),
  retry: {
    initialRetryTime: 100,
    retries: 8,
  },
  requestTimeout: 30000,
  connectionTimeout: 3000,
});

export default registerAs("kafka", getKafkaConfig);
