import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  kafkaConfig,
  loggerConfig,
  pgConfig,
  serviceConfig,
} from './config';
import { TokenPricesModule } from './modules/token-prices';
import { MainLoggerModule } from './shared/logger';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        loggerConfig,
        pgConfig,
        serviceConfig,
        kafkaConfig,
      ],
    }),
    ScheduleModule.forRoot(),
    MainLoggerModule.forRoot(loggerConfig()),
    TypeOrmModule.forRootAsync({
      useFactory: (conf: ConfigType<typeof pgConfig>) => conf,
      inject: [pgConfig.KEY],
    }),
    TokenPricesModule,
  ],
  controllers: [],
})
export class AppModule {}
