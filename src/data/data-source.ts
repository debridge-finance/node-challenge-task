import { DataSource } from 'typeorm';
import { TokenEntity } from '@/models/token';
import { InitialMigration1684654321000 } from '@/drivers/database/migrations/1684654321000-InitialMigration';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'tokens',
  entities: [TokenEntity],
  migrations: [InitialMigration1684654321000],
  synchronize: false, // Set to false when using migrations
  logging: true,
});
