import { Module } from '@nestjs/common';
import { ConfigModule } from '@/config';
import { DatabaseModule } from '@/drivers/database';
import { KafkaModule } from '@/drivers/kafka';
import { TokenServiceModule } from '@/services/token';

@Module({
  imports: [ConfigModule, KafkaModule, DatabaseModule, TokenServiceModule],
})
export class AppModule {}
