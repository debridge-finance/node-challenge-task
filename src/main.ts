import { INestApplicationContext, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { startApp } from './boot';

const appPromise: Promise<INestApplicationContext> = startApp(AppModule)
  .then((app) => {
    Logger.log('Application sucesfully bootstrapped');

    return app;
  });

export default appPromise;
