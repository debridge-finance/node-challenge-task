import {Module, OnModuleInit} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from './token.entity';
import { TokenSeeder } from './token.seeder';
import {TokenPriceUpdateService} from "./token-price-update.service";
import {MockPriceService} from "./mock-price.service";
import {KafkaModule} from "../kafka/kafka-module";
import {ChainModule} from "../chains/chain.module";
import {LogoModule} from "../logos/logo.module";

@Module({
    imports: [TypeOrmModule.forFeature([Token]),ChainModule,LogoModule,KafkaModule],
    providers: [TokenSeeder, TokenPriceUpdateService,MockPriceService],
    exports: [TokenSeeder,MockPriceService],
})
export class TokenModule  {}
