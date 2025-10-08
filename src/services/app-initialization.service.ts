import { Injectable, Logger } from '@nestjs/common';
import { TokenSeeder } from '../data/token.seeder';
import { TokenPriceUpdateService } from './token-price-update.service';

@Injectable()
export class AppInitializationService {
  private readonly logger = new Logger(AppInitializationService.name);

  constructor(
    private readonly tokenSeeder: TokenSeeder,
    private readonly tokenPriceUpdateService: TokenPriceUpdateService,
  ) {}

  async initialize(): Promise<void> {
    try {
      this.logger.log('Starting application initialization...');
      
      // Seed initial data
      await this.tokenSeeder.seed();
      this.logger.log('Database seeding completed');
      
      // Start price update service
      this.tokenPriceUpdateService.start();
      this.logger.log('Price update service started');
      
      this.logger.log('Application initialization completed successfully');
    } catch (error) {
      this.logger.error('Failed to initialize application:', error);
      throw error;
    }
  }
}
