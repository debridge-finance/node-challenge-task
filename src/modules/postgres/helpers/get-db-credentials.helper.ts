import { ConfigService } from "@nestjs/config";
import { AppEnvs } from "../../../config/app-envs.schema";

interface DbCredentials {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export const getPostgresCredentials = (
  configService: ConfigService<AppEnvs>
): DbCredentials => {
  return {
    host: configService.getOrThrow<string>("POSTGRES_HOST"),
    port: configService.getOrThrow<number>("POSTGRES_PORT"),
    username: configService.getOrThrow<string>("POSTGRES_USERNAME"),
    password: configService.getOrThrow<string>("POSTGRES_PASSWORD"),
    database: configService.getOrThrow<string>("POSTGRES_DATABASE"),
  };
};
