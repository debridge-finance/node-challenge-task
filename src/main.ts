import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

async function bootstrap() {
  const logger = new Logger("Main");
  logger.log("Starting Token Price Service...");

  try {
    const app = await NestFactory.create(AppModule);
    const configService = app.get<ConfigService>(ConfigService);
    const port = configService.get('SERVER_PORT');

    await app.listen(port);
    logger.log("Service is running on port 3000");
  } catch (error) {
    // Bug: Not handling exceptions properly
    logger.error(`Error: ${error.message}`);
  }
}
bootstrap();
