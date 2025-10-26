import { registerAs } from '@nestjs/config';
import { validateConfig } from './app.config';

// DB config
export const dbConfig = registerAs('database', () => {
  const config = validateConfig(process.env);

  return {
    type: 'postgres' as const,
    host: config.DB_HOST,
    port: config.DB_PORT,
    username: config.DB_USERNAME,
    password: config.DB_PASSWORD,
    database: config.DB_DATABASE,
    entities: [__dirname + '/../models/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../migrations/[0-9]*{.ts,.js}'], // Только файлы миграций, не run-migrations
    migrationsRun: true, // Миграции запускаются автоматически при старте
    synchronize: false,
    logging: config.NODE_ENV === 'development',
  };
});

// Kafka config
export const kafkaConfig = registerAs('kafka', () => {
  const config = validateConfig(process.env);

  return {
    clientId: config.KAFKA_CLIENT_ID,
    brokers: config.KAFKA_BROKERS.split(','),
    topic: config.KAFKA_TOPIC,
  };
});

// App config
export const appConfig = registerAs('application', () => {
  const config = validateConfig(process.env);

  return {
    port: config.PORT,
    nodeEnv: config.NODE_ENV,
    logLevel: config.LOG_LEVEL,
  };
});
