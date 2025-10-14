import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { Token } from '../models/token.entity';
import { Chain } from '../models/chain.entity';
import { Logo } from '../models/logo.entity';

export const getDatabaseConfig = (): TypeOrmModuleAsyncOptions => {
  return {
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
      type: 'postgres',
      host: configService.get('DATABASE_HOST', 'localhost'),
      port: configService.get('DATABASE_PORT', 5432),
      username: configService.get('DATABASE_USERNAME', 'postgres'),
      password: configService.get('DATABASE_PASSWORD', 'postgres'),
      database: configService.get('DATABASE_NAME', 'tokens'),
      entities: [Token, Chain, Logo],
      migrations: [`${__dirname}/../migrations/**/*{.ts,.js}`],
      migrationsRun: true,
      synchronize: false,
      ssl: false,
    }),
  };
};
