import { NestFactory } from "@nestjs/core";
import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppEnvs } from "./config/app-envs.schema";
import { AppModule } from "./modules/app.module";

async function bootstrap(): Promise<void> {
  const logger = new Logger(bootstrap.name);

  logger.log("Starting Nest.JS Token Price Service...");

  try {
    const app = await NestFactory.create(AppModule);

    const configService = app.get(ConfigService<AppEnvs>);
    const port = configService.getOrThrow<number>("PORT");

    await app.listen(port);

    logger.log(`Service is running on port ${port}`);
  } catch (error) {
    logger.error(
      `Failed to start the server. Error: ${error.message}`,
      error.stack
    );
    process.exit(1);
  }
}

bootstrap();
