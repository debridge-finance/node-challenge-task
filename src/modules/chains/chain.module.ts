import {Module, OnModuleInit} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {Chain} from "./chain.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Chain])],
    providers: [],
    exports: [TypeOrmModule],
})
export class ChainModule  {}
