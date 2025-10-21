import { DataSource } from 'typeorm';
import { Token } from '../models/token.entity';
import { Chain } from '../models/chain.entity';
import { Logo } from '../models/logo.entity';
import { InitialMigration1684654321000 } from '../migrations/1684654321000-InitialMigration';
import { NormalizeSchema1684654322000 } from '../migrations/1684654322000-NormalizeSchema';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'tokens',
  entities: [Token, Chain, Logo],
  migrations: [InitialMigration1684654321000, NormalizeSchema1684654322000],
  synchronize: false, // Set to false when using migrations
  logging: true,
});
