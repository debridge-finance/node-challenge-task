import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { getDatabaseConfig } from './config/database.config';
import { TokenModule } from './modules/token/token.module';
import { TokenBatchModule } from './modules/token-batch/token-batch.module';
import { PriceUpdaterModule } from './modules/price-updater/price-updater.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync(getDatabaseConfig()),
    TokenModule,
    TokenBatchModule,
    PriceUpdaterModule,
  ],
})
export class AppModule {}
