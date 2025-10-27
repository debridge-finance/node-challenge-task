// Implemented ConfigService
import { ConfigService } from "@nestjs/config";
import { DataSource, DataSourceOptions } from "typeorm";
import { Token } from "../models/token.entity";

export const getDataSourceOptions = (
  configService: ConfigService
): DataSourceOptions => ({
  type: "postgres",
  host: configService.get<string>("DB_HOST", "localhost"),
  port: configService.get<number>("DB_PORT", Number(configService.get<string>("DB_PORT") || 5432)),
  username: configService.get<string>("DB_USER"),
  password: configService.get<string>("DB_PASSWORD"),
  database: configService.get<string>("DB_NAME"),
  entities: [Token],
  synchronize: false,
  logging: true,
});

const configServiceInstance = new ConfigService();

export const AppDataSource = new DataSource({
  ...getDataSourceOptions(configServiceInstance),
  migrations: [__dirname + "/migrations/*.{js,ts}"],
  migrationsRun: true,
});
