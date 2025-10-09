import {Module} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {Logo} from "./logo.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Logo])],
    providers: [],
    exports: [TypeOrmModule],
})
export class LogoModule  {}
