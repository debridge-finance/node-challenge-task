import { registerAs } from "@nestjs/config";

export interface RedisConfigOptions {
  host: string;
  port: number;
  password?: string | undefined;
  db: number;
  retryDelayOnFailover: number;
  maxRetriesPerRequest: number;
}

export const redisConfig = registerAs(
  "redis",
  (): RedisConfigOptions => ({
    host: process.env["REDIS_HOST"] || "localhost",
    port: Number(process.env["REDIS_PORT"]) || 6379,
    password: process.env["REDIS_PASSWORD"] || undefined,
    db: Number(process.env["REDIS_DB"]) || 0,
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
  })
);
