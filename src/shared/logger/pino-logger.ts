import {
  Inject,
  Injectable,
  Optional,
  Scope,
} from '@nestjs/common';
import pino from 'pino';
import { Counter } from 'prom-client';
import {
  CONTEXT_FIELD_NAME,
  ERROR_METRIC_COUNTER,
  PINO_ROOT_LOGGER,
} from './constants';
import { LoggerFn, PinoMethods } from './types';

const isFirstArgObject = (args: Parameters<LoggerFn>):  args is [obj: object, msg?: string, ...args: any[]] => typeof args[0] === 'object';

@Injectable({ scope: Scope.TRANSIENT })
export class PinoLogger implements PinoMethods {
  private context = '';

  constructor(
    @Inject(CONTEXT_FIELD_NAME) private readonly contextName: string,
    @Inject(PINO_ROOT_LOGGER) private readonly rootLogger: pino.Logger,
    @Optional() @Inject(ERROR_METRIC_COUNTER) private readonly errorCounter?: Counter,
  ) {}

  trace(msg: string, ...args: any[]): void;
  trace(obj: unknown, msg?: string, ...args: any[]): void;
  trace(...args: Parameters<LoggerFn>) {
    this.call('trace', ...args);
  }

  debug(msg: string, ...args: any[]): void;
  debug(obj: unknown, msg?: string, ...args: any[]): void;
  debug(...args: Parameters<LoggerFn>) {
    this.call('debug', ...args);
  }

  info(msg: string, ...args: any[]): void;
  info(obj: unknown, msg?: string, ...args: any[]): void;
  info(...args: Parameters<LoggerFn>) {
    this.call('info', ...args);
  }

  warn(msg: string, ...args: any[]): void;
  warn(obj: unknown, msg?: string, ...args: any[]): void;
  warn(...args: Parameters<LoggerFn>) {
    this.call('warn', ...args);
  }

  error(msg: string, ...args: any[]): void;
  error(obj: unknown, msg?: string, ...args: any[]): void;
  error(...args: Parameters<LoggerFn>) {
    this.call('error', ...args);
  }

  fatal(msg: string, ...args: any[]): void;
  fatal(obj: unknown, msg?: string, ...args: any[]): void;
  fatal(...args: Parameters<LoggerFn>) {
    this.call('fatal', ...args);
  }

  setContext(value: string) {
    this.context = value;
  }

  private call(method: pino.Level, ...args: Parameters<LoggerFn>) {
    if (this.context && isFirstArgObject(args)) {
      args = this.formatObjLog(method, ...args);
    } else if (this.context) {
      args = [{ [this.contextName]: this.context }, ...args] as Parameters<LoggerFn>;
    }
    this.updateErrorMetric(method, args[0]);

    // @ts-ignore args are union of tuple types
    this.rootLogger[method](...args);
  }

  private updateErrorMetric(method: pino.Level, objArg: any): void {
    if (!this.errorCounter || !['warn', 'error', 'fatal'].includes(method)) {
      return;
    }

    if (objArg?.withMetric) {
      const code = objArg?.code ?? objArg?.err?.code ?? 'unknown';
      this.errorCounter.inc({
        level: method,
        code,
      });
    }
  }

  private formatObjLog(method: pino.Level, ...args: Parameters<LoggerFn>): Parameters<LoggerFn> {
    const firstArg = args[0];

    return [
      Object.assign(
        { [this.contextName]: this.context },
        firstArg instanceof Error
          ? { err: firstArg }
          : firstArg,
      ),
      ...args.slice(1),
    ];
  }
}

