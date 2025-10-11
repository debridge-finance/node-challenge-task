import { DataSource } from 'typeorm';
import { Token } from '../models/token.entity';
import { InitialMigration1684654321000 } from '../migrations/1684654321000-InitialMigration';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'tokens',
  entities: [Token],
  migrations: [InitialMigration1684654321000],
  synchronize: false, // Set to false when using migrations
  logging: true,
  ssl: process.env.DB_SSL === 'true' ? true : false,
});
