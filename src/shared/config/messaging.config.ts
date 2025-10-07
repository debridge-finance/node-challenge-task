import { registerAs } from "@nestjs/config";
import { MessageBrokerType, CompressionType } from "../enums";

export interface MessagingConfigOptions {
  type: MessageBrokerType;
  connection: {
    brokers: string[];
    clientId: string;
  };
  topics: {
    priceUpdates: string;
    errors: string;
  };
  options?: {
    retries?: number;
    timeout?: number;
    compression?: CompressionType;
  };
}

export const messagingConfig = registerAs(
  "messaging",
  (): MessagingConfigOptions => ({
    type: MessageBrokerType.KAFKA,
    connection: {
      brokers: (process.env["MESSAGING_BROKERS"] || "localhost:9092").split(","),
      clientId: process.env["MESSAGING_CLIENT_ID"] || "token-price-service",
    },
    topics: {
      priceUpdates: process.env["MESSAGING_TOPIC_PRICE_UPDATES"] || "token-price-updates",
      errors: process.env["MESSAGING_TOPIC_ERRORS"] || "system-errors",
    },
    options: {
      retries: Number(process.env["MESSAGING_RETRIES"]) || 3,
      timeout: Number(process.env["MESSAGING_TIMEOUT"]) || 5000,
      compression:
        (process.env["MESSAGING_COMPRESSION"] as CompressionType) || CompressionType.GZIP,
    },
  })
);
