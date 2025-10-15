import { Module } from '@nestjs/common';
import { ConfigModule } from '@/config';
import { DatabaseModule } from '@/drivers/database';
import { TokenServiceModule } from '@/services/token';

@Module({
  imports: [ConfigModule, DatabaseModule, TokenServiceModule],
})
export class AppModule {}
