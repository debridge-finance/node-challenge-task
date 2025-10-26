import { z } from 'zod';

export const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  LOG_LEVEL: z.enum(['error', 'warn', 'log', 'debug', 'verbose']).default('log'),

  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().transform(Number).default('5432'),
  DB_USERNAME: z.string().default('postgres'),
  DB_PASSWORD: z.string().default('postgres'),
  DB_DATABASE: z.string().default('tokens'),

  KAFKA_CLIENT_ID: z.string().default('token-price-service'),
  KAFKA_BROKERS: z.string().default('localhost:9092'),
  KAFKA_TOPIC: z.string().default('token-price-updates'),
});

export type AppConfig = z.infer<typeof configSchema>;

export const validateConfig = (env: Record<string, unknown>): AppConfig => configSchema.parse(env);
