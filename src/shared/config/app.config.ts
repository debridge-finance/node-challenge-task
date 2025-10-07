import { registerAs } from "@nestjs/config";
import { Environment } from "../enums";

export interface AppConfigOptions {
  env: Environment;
  appName: string;
  port: number;
  nodeEnv: Environment;
}

export const appConfig = registerAs(
  "app",
  (): AppConfigOptions => ({
    env: (process.env["NODE_ENV"] as Environment) || Environment.DEVELOPMENT,
    appName: process.env["APP_NAME"] || "Token Price Service",
    port: Number(process.env["APP_PORT"]) || 3000,
    nodeEnv: (process.env["NODE_ENV"] as Environment) || Environment.DEVELOPMENT,
  })
);
