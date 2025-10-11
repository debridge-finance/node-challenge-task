import { DataSource, DataSourceOptions } from "typeorm";
import { getDatabaseConfig } from "../config/database.config";

const databaseConfig = getDatabaseConfig();

export const AppDataSource = new DataSource({
  ...databaseConfig,
  logging: true,
} as DataSourceOptions);
