import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { staticConfig } from '@/config';

dotenvConfig({ path: '.env' });

const config = {
  type: 'postgres',
  host: staticConfig.database.host,
  port: staticConfig.database.port,
  username: staticConfig.database.user,
  password: staticConfig.database.password,
  database: staticConfig.database.name,
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  migrations: [__dirname + '/migrations/*.{js,ts}'],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: true,
};

export default registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);
