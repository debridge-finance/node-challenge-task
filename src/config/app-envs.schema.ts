// src/config/app-env.schema.ts
import { z } from "zod";

export const AppEnvsSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  PORT: z.coerce.number().default(3000),

  // Postgre
  POSTGRES_HOST: z.string().default("localhost"),
  POSTGRES_PORT: z.coerce.number().default(5432),
  POSTGRES_USERNAME: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DATABASE: z.string(),
  POSTGRES_SCHEMA: z.string().optional(),

  // Kafka
  KAFKA_BROKERS: z.string().default("localhost:9092"),
  KAFKA_CLIENT_ID: z.string().default("token-price-service"),
  KAFKA_RETRY_INITIAL_TIME: z.coerce.number().default(300),
  KAFKA_RETRY_MAX_RETRIES: z.coerce.number().default(10),

  // Optional flags
  LOCAL: z.string().optional(),
});

export type AppEnvs = z.infer<typeof AppEnvsSchema>;
