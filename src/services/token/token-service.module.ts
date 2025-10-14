import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KafkaModule } from '@/drivers/kafka';
import { TokenEntity } from '@/models/token';
import { PriceServiceModule } from './price';
import { TokenService } from './token.service';
import { TokenCron } from './token.cron';

@Module({
  imports: [
    TypeOrmModule.forFeature([TokenEntity]),
    KafkaModule,
    PriceServiceModule,
  ],
  providers: [TokenService, TokenCron],
  exports: [TokenService],
})
export class TokenServiceModule {}
