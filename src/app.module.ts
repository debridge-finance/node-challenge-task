import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import {
  appConfig,
  databaseConfig,
  redisConfig,
  monitoringConfig,
  messagingConfig,
  httpConfig,
} from "./shared/config";
import { DatabaseConfigOptions } from "./shared/config/database.config";
import { getRequiredConfig } from "./shared/utils/config.utils";

import { Token } from "./modules/token-price/entities/token.entity";
import { TokenPrice } from "./modules/token-price/entities/token-price.entity";
import { PriceFeed } from "./modules/token-price/entities/price-feed.entity";
import { OutboxEvent } from "./modules/infrastructure/entities/outbox-event.entity";
import { Logo } from "./modules/token-price/entities/logo.entity";

import { HealthModule } from "./modules/health/health.module";
import { ScheduleModule } from "@nestjs/schedule";

// Модули
import { TokenPriceModule } from "./modules/token-price/token-price.module";
import { MessagingModule } from "./modules/messaging/messaging.module";
import { InfrastructureModule } from "./modules/infrastructure/infrastructure.module";
import { SharedModule } from "./shared/shared.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig, monitoringConfig, messagingConfig, httpConfig],
    }),
    ScheduleModule.forRoot(),

    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const dbConfig = getRequiredConfig<DatabaseConfigOptions>(configService, "database");
        return {
          type: dbConfig.type,
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.database,
          entities: [Token, TokenPrice, PriceFeed, OutboxEvent, Logo],
          synchronize: dbConfig.synchronize,
          logging: dbConfig.logging,
          retryAttempts: dbConfig.retryAttempts,
          retryDelay: dbConfig.retryDelay,
          maxConnections: dbConfig.maxConnections,
          connectionTimeout: dbConfig.connectionTimeout,
        };
      },
      inject: [ConfigService],
    }),

    // Бизнес-модули
    TokenPriceModule,

    // Инфраструктурные модули
    MessagingModule,
    InfrastructureModule,
    SharedModule,

    // Health модуль
    HealthModule,
  ],
})
export class AppModule {}
