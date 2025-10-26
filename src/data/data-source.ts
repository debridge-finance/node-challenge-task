import { DataSource } from 'typeorm';
import { Token } from '../models/token.entity';
import { InitialMigration1684654321000 } from '../migrations/1684654321000-InitialMigration';
import { validateConfig } from 'src/config/app.config';

const config = validateConfig(process.env);

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.DB_HOST,
  port: config.DB_PORT,
  username: config.DB_USERNAME,
  password: config.DB_PASSWORD,
  database: config.DB_DATABASE,
  entities: [Token],
  migrations: [InitialMigration1684654321000],
  synchronize: false, // Set to false when using migrations
  logging: true,
});
