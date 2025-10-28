import { MainLoggerModuleConfig } from './types';

export const PINO_TRANSPORT = Symbol('PINO_TRANSPORT');
export const PINO_ROOT_LOGGER = Symbol('PINO_ROOT_LOGGER');
export const CONTEXT_FIELD_NAME = Symbol('CONTEXT_FIELD_NAME');
export const THROTTLE_CACHE_MAP = Symbol('THROTTLE_CACHE_MAP');

export const ERROR_METRIC_COUNTER = Symbol('ERROR_METRIC_COUNTER');

export const defaultContextFieldName = 'context';

export const defaultLoggerConfig: MainLoggerModuleConfig = {
  contextFieldName: 'context',
  pretty: false,
  level: 'info',
};
