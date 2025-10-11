import { NestFactory } from "@nestjs/core";
import { AppModule } from "./modules/app/app.module";
import { Logger } from "@nestjs/common";

async function bootstrap() {
  const logger = new Logger("Main");
  logger.log("Starting Token Price Service...");

  try {
    const app = await NestFactory.create(AppModule);

    // Enable graceful shutdown
    app.enableShutdownHooks();

    // Handle uncaught exceptions
    process.on("uncaughtException", (error) => {
      logger.error(`Uncaught Exception: ${error.message}`, error.stack);
      app.close();
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (reason) => {
      logger.error(`Unhandled Rejection reason: `, reason);
      app.close();
    });

    // The app does not handle HTTP requests, so use init instead of listen
    await app.init();
  } catch (error) {
    const { message, stack } = error instanceof Error ? error : ({} as Error);
    logger.error(`Failed to start application: ${message || error}`, stack);
  }
}

bootstrap();
