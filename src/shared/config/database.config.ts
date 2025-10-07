import { registerAs } from "@nestjs/config";
import { DatabaseType } from "../enums";

export interface DatabaseConfigOptions {
  type: DatabaseType;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  logging: boolean;
  synchronize: boolean;
  retryAttempts: number;
  retryDelay: number;
  maxConnections: number;
  connectionTimeout: number;
}

export const databaseConfig = registerAs(
  "database",
  (): DatabaseConfigOptions => ({
    type: DatabaseType.POSTGRES,
    host: process.env["PG_HOST"] || "localhost",
    port: Number(process.env["PG_PORT"]) || 5432,
    username: process.env["PG_USER"] || "postgres",
    password: process.env["PG_PASSWORD"] || "password",
    database: process.env["PG_DB"] || "token_price_service",
    logging: process.env["TYPEORM_LOGGING"] === "true",
    synchronize: false, // Всегда false для production
    retryAttempts: Number(process.env["DB_RETRY_ATTEMPTS"]) || 3,
    retryDelay: Number(process.env["DB_RETRY_DELAY"]) || 1000,
    maxConnections: Number(process.env["DB_MAX_CONNECTIONS"]) || 10,
    connectionTimeout: Number(process.env["DB_CONNECTION_TIMEOUT"]) || 30000,
  })
);
