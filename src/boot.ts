import { Logger as BaseLogger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import pino from 'pino';
import { PinoNestLogger } from './shared/logger';

export const boostrap = async (rootModule: any) => {
  const app = await NestFactory.createApplicationContext(
    rootModule,
    { bufferLogs: true },
  );

  app.useLogger(app.get(PinoNestLogger));
  BaseLogger.flush();

  app.enableShutdownHooks();

  await app.init();

  return app;
};

export const startApp = async (rootModule: any) => {
  const finalDest = pino.destination({ sync: true, dest: 1 });
  const finalLogger = pino(finalDest) as unknown as PinoNestLogger;

  return boostrap(rootModule).catch<never>((err) => {
    finalLogger.error({ err }, 'global error occur, closing process');
    finalDest.flushSync();
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  });
};
