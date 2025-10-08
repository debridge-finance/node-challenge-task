import { z } from 'zod';

// Схема валидации для переменных окружения
export const configSchema = z.object({
  // Настройки приложения
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  
  // Настройки базы данных PostgreSQL
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().transform(Number).default('5432'),
  DB_USERNAME: z.string().default('postgres'),
  DB_PASSWORD: z.string().default('postgres'),
  DB_DATABASE: z.string().default('tokens'),
  DB_SSL: z.string().transform(val => val === 'true').default('false'),
  
  // Настройки Kafka
  KAFKA_CLIENT_ID: z.string().default('token-price-service'),
  KAFKA_BROKERS: z.string().default('localhost:9092'),
  KAFKA_TOPIC: z.string().default('token-price-updates'),
  
  // Настройки логирования
  LOG_LEVEL: z.enum(['error', 'warn', 'log', 'debug', 'verbose']).default('log'),
});

// Тип конфигурации
export type AppConfig = z.infer<typeof configSchema>;

// Функция для валидации и парсинга конфигурации
export function validateConfig(env: Record<string, unknown>): AppConfig {
  return configSchema.parse(env);
}
