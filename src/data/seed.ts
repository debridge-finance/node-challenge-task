import { AppDataSource } from "./data-source";
import { TokenSeeder } from "./token.seeder";
import { Token } from "../modules/token-price/entities/token.entity";
import { Logger } from "@nestjs/common";

async function seed() {
  const logger = new Logger("Seed");

  try {
    // Initialize the data source
    await AppDataSource.initialize();
    logger.log("Data source has been initialized");

    // Get repositories
    const tokenRepository = AppDataSource.getRepository(Token);

    // Create token seeder with all repositories
    const tokenSeeder = new TokenSeeder(tokenRepository);

    // Seed data
    await tokenSeeder.seed();
    logger.log("Database seeded successfully");

    // Close the connection
    await AppDataSource.destroy();
    logger.log("Data source has been closed");
  } catch (error) {
    logger.error("Error during seeding process:", error);
    process.exit(1);
  }
}

// Run the seeder
const logger = new Logger("SeedRunner");
seed()
  .then(() => {
    logger.log("Seeding completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    logger.error("Failed to seed database:", error);
    process.exit(1);
  });
