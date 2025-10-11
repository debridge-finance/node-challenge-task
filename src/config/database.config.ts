import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { registerAs } from '@nestjs/config';

export const getDatabaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'tokens',
  entities: [__dirname + '/../models/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/[0-9]*.{js,ts}'],
  migrationsRun: true, // Run migrations automatically
  synchronize: false, // Disabled when using migrations
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export default registerAs('database', getDatabaseConfig);
