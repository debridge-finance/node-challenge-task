import { registerAs } from '@nestjs/config';
import { validateConfig } from './app.config';

// Конфигурация для базы данных
export const databaseConfig = registerAs('database', () => {
  const config = validateConfig(process.env);
  
  return {
    type: 'postgres' as const,
    host: config.DB_HOST,
    port: config.DB_PORT,
    username: config.DB_USERNAME,
    password: config.DB_PASSWORD,
    database: config.DB_DATABASE,
    ssl: config.DB_SSL,
    entities: [__dirname + '/../models/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    migrationsRun: true,
    synchronize: false,
    logging: config.NODE_ENV === 'development',
  };
});

// Конфигурация для Kafka
export const kafkaConfig = registerAs('kafka', () => {
  const config = validateConfig(process.env);
  
  return {
    clientId: config.KAFKA_CLIENT_ID,
    brokers: config.KAFKA_BROKERS.split(','),
    topic: config.KAFKA_TOPIC,
  };
});

// Конфигурация приложения
export const appConfig = registerAs('app', () => {
  const config = validateConfig(process.env);
  
  return {
    port: config.PORT,
    nodeEnv: config.NODE_ENV,
    logLevel: config.LOG_LEVEL,
  };
});
