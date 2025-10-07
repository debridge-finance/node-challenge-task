import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger } from "@nestjs/common";
import { GlobalExceptionFilter } from "./shared/filters/global-exception.filter";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { ConfigService } from "@nestjs/config";
import { HttpConfigOptions } from "./shared/config/http.config";
import { getRequiredConfig } from "./shared/utils/config.utils";

async function bootstrap() {
  const logger = new Logger("Main");
  logger.log("Starting Token Price Service...");

  try {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const httpConfig = getRequiredConfig<HttpConfigOptions>(configService, "http");

    // Настройки безопасности
    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
          },
        },
        crossOriginEmbedderPolicy: false,
      })
    );

    // CORS настройки
    app.enableCors({
      origin: httpConfig.cors.origins,
      methods: httpConfig.cors.methods,
      allowedHeaders: httpConfig.cors.allowedHeaders,
      credentials: httpConfig.cors.credentials,
    });

    // Rate limiting
    app.use(
      rateLimit({
        windowMs: httpConfig.rateLimit.windowMs,
        max: httpConfig.rateLimit.max,
        message: {
          error: "Too many requests from this IP, please try again later.",
          statusCode: 429,
          timestamp: new Date().toISOString(),
        },
        standardHeaders: true,
        legacyHeaders: false,
      })
    );

    // Добавляем глобальный фильтр исключений
    app.useGlobalFilters(new GlobalExceptionFilter());

    // Включаем graceful shutdown - NestJS автоматически обработает SIGTERM/SIGINT
    app.enableShutdownHooks();

    const port = Number(process.env["APP_PORT"] || 3000);
    await app.listen(port);
    logger.log(`Service is running on port ${port}`);
    logger.log(`Health check available at http://localhost:${port}/health`);
  } catch (error) {
    logger.error(`Fatal: ${(error as Error).stack || (error as Error).message}`);
    process.exit(1);
  }
}

bootstrap();
