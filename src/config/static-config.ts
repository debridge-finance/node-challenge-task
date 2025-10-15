import 'dotenv/config';
import { databaseConfig } from './database.config';
import { contractsConfig } from './contracts.config';

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const logLevel = process.env.LOG_LEVEL
  ? process.env.LOG_LEVEL.toLowerCase()
  : 'info';

/*
 This configuration is used directly only when dependency injection is not working,
 e.g. during application startup and its setup.
 Also, it initially fulfills dynamic (dependency-injection-based, main) configuration.
 */
export const staticConfig = {
  port,
  logLevel,
  database: databaseConfig,
  contracts: contractsConfig,
};
