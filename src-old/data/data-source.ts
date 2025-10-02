import { DataSource } from 'typeorm';
import { Token } from '../models/token.entity';
import { InitialMigration1684654321000 } from '../migrations/1684654321000-InitialMigration';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'tokens',
  entities: [Token],
  migrations: [InitialMigration1684654321000],
  migrationsTransactionMode: "all",
  synchronize: false,
  logging: true,
});
