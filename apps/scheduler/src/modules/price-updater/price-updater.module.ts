import { Module } from '@nestjs/common';
import { PriceUpdateConsumer } from './price-update.consumer';
import { TokenModule } from '../token/token.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from '../../models/token.entity';

@Module({
  imports: [TokenModule, TypeOrmModule.forFeature([Token])],
  controllers: [PriceUpdateConsumer],
  providers: [PriceUpdateConsumer],
})
export class PriceUpdaterModule {}
