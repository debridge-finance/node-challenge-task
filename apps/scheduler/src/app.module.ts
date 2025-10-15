import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { getDatabaseConfig } from './config/database.config';
import { TokenSeederModule } from './modules/token-seeder/token-seeder.module';
import { TokenBatchModule } from './modules/token-batch/token-batch.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync(getDatabaseConfig()),
    TokenSeederModule,
    TokenBatchModule,
  ],
  controllers: [],
})
export class AppModule {}
