import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {ConfigModule} from '@nestjs/config';
import {TokenModule} from "./modules/tokens/token.module";
import {KafkaModule} from "./modules/kafka/kafka-module";
import { ormConfig} from "./data/data-source";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync(({
        useFactory:()=>ormConfig
    })),
    TokenModule,
    KafkaModule
  ],
  controllers: [],
  providers: [
  ],
})
export class AppModule {}
