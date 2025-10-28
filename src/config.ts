import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import ev from 'env-var';
import {
  Chain,
  Logo,
  Price,
  Token,
} from './models/entities';
import { MainLoggerModuleConfig } from './shared/logger';

const globalDefaults = {
  appName: 'TOKEN-PRICE-FETCHER',
};

export const loggerConfig = registerAs('logger', (): MainLoggerModuleConfig => {
  const levels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];

  return {
    name: ev.get('APP_NAME').default(globalDefaults.appName).asString(),
    level: ev.get('LOG_LEVEL').default('info').asEnum(levels),
    pretty: ev.get('LOG_PRETTY').default('0').asBool(),
    prettyOptions: {
      singleLine: ev.get('LOG_PRETTY_SINGLE_LINE').default('0').asBool(),
    },
    throttleLimit: ev.get('LOG_THROTTLE_LIMIT').default('0').asIntPositive(),
    throttleLimitTttMs: ev.get('LOG_THROTTLE_LIMIT_TTL_MS').default('60000').asIntPositive(),
  };
});

export const pgConfig = registerAs('pg', (): TypeOrmModuleOptions & { type: 'postgres' } => {
  return {
    type: 'postgres',
    host: ev.get('PG_HOST').default('127.0.0.1').asString(),
    port: ev.get('PG_PORT').default('5432').asIntPositive(),
    username: ev.get('PG_USER').required().asString(),
    password: ev.get('PG_PASSWORD').required().asString(),
    database: ev.get('PG_DATABASE').required().asString(),
    schema: ev.get('PG_SCHEMA').default('public').asString(),
    retryAttempts: ev.get('PG_MAX_CONNECT_RETRIES').default('10').asIntPositive(),
    retryDelay: ev.get('PG_MAX_RETRY_DELAY').default('3000').asIntPositive(),
    connectTimeoutMS: ev.get('PG_CONNECT_TIMEOUT_MS').default('10000').asIntPositive(),
    applicationName: ev.get('APP_NAME').default(globalDefaults.appName).asString(),
    poolSize: ev.get('PG_MAX_POOL_SIZE').default('10').asIntPositive(),
    useUTC: true,
    // no synchronization in production
    synchronize: false,
    // no auto migrations in production
    migrationsRun: false,
    entities: [Token, Price, Chain, Logo],
  };
});

export const kafkaConfig = registerAs('kafka', () => {
  return {
    brokers: ev.get('KAFKA_BROKERS').required().asArray(),
    clientId: ev.get('KAFKA_CLIENT_ID').default(globalDefaults.appName).asString(),
  };
});

export const serviceConfig = registerAs('service', () => {
  return {
    updatePriceIntervalSec: ev.get('UPDATE_PRICE_INTERVAL_SEC').default('5').asIntPositive(),
    updatePriceKafkaTopic: ev.get('UPDATE_PRICE_KAFKA_TOPIC').default('token-price-updates').asString(),
  };
});
