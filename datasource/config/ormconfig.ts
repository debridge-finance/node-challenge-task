import { ConfigService } from "@nestjs/config";
import * as dotenv from "dotenv";
import { DataSource } from "typeorm";
import { AppEnvsSchema } from "../../src/config/app-envs.schema";
import { getPostgresCredentials } from "../../src/modules/postgres/helpers/get-db-credentials.helper";

dotenv.config();

const buildDataSource = async (): Promise<DataSource> => {
  const validatedEnv = AppEnvsSchema.parse(process.env);
  const configService = new ConfigService(validatedEnv);

  const postgreCreds = getPostgresCredentials(configService);

  const isProduction = configService.getOrThrow("NODE_ENV") === "production";

  return new DataSource({
    type: "postgres",
    ...postgreCreds,
    synchronize: false,
    migrations: isProduction
      ? ["./dist/datasource/migrations/*.js"]
      : ["./datasource/migrations/*.ts"],
    entities: isProduction
      ? ["./dist/src/**/*.entity.js"]
      : ["./src/**/*.entity.{ts,js}"],
  });
};

export default buildDataSource();
