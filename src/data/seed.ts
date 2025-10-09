import { AppDataSource } from './data-source';
import {TokenSeeder} from "../modules/tokens/token.seeder";
import {Token} from "../modules/tokens/token.entity";
import {Logo} from "../modules/logos/logo.entity";
import {Chain} from "../modules/chains/chain.entity";

async function seed() {
  try {
    // Initialize the data source
    await AppDataSource.initialize();

    const manager = AppDataSource.manager;

    // Create token seeder
    const tokenSeeder = new TokenSeeder(manager);

    // Seed data
    await tokenSeeder.seed();
    console.log('Database seeded successfully');

    // Close the connection
    await AppDataSource.destroy();
    console.log('Data source has been closed');
  } catch (error) {
    console.error('Error during seeding process:', error);
    process.exit(1);
  }
}

// Run the seeder
seed()
  .then(() => {
    console.log('Seeding completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to seed database:', error);
    process.exit(1);
  });
