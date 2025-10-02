import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Main');
  logger.log('Starting Token Price Service...');
  
  try {
    const app = await NestFactory.create(AppModule);
    
    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Rejection:', reason);
    });
    
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });
    
    await app.listen(3000);
    logger.log('Service is running on port 3000');
    
  } catch (error) {
    logger.error(`Error: ${error.message}`);
    process.exit(1);
  }
}
bootstrap();
