import { MessageBrokerType } from "src/shared/enums";

/**
 * Интерфейс для публикации сообщений
 * Позволяет легко переключаться между разными messaging системами
 */
export interface MessagePublisher {
  publish<T = unknown>(topic: string, message: T, key?: string): Promise<void>;

  isConnected(): boolean;

  connect(): Promise<void>;

  disconnect(): Promise<void>;
}

export interface MessagingConfig {
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
    compression?: string;
  };
}
