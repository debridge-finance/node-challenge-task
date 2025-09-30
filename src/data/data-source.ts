import { DataSource } from 'typeorm';
import { Token } from '../models/token.entity';

export const AppDataSource = new DataSource({
  // NOTE: Конфигурацию надо вынести в ConfigService
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'tokens',
  entities: [Token],
  // NOTE: Динамически загружаем миграции
  migrations: [__dirname + '/../migrations/*.{js,ts}'],
  synchronize: false, // Set to false when using migrations
  logging: true,
});
