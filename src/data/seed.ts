import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { TokenSeeder } from './token.seeder';
import { Logger } from '@nestjs/common';

async function seed() {
  const logger = new Logger('Seed');

  try {
    logger.log('Starting database seeding...');

    // Create NestJS application context
    const app = await NestFactory.createApplicationContext(AppModule);

    // Get the seeder service from DI container
    const tokenSeeder = app.get(TokenSeeder);

    // Seed data
    await tokenSeeder.seed();
    logger.log('Database seeded successfully');

    // Close the application context
    await app.close();
    logger.log('Application context closed');
  } catch (error) {
    logger.error('Error during seeding process:', error);
    process.exit(1);
  }
}

// Run the seeder
seed()
  .then(() => {
    console.log('Seeding completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Failed to seed database:', error);
    process.exit(1);
  });
