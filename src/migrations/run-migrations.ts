import { AppDataSource } from "../data/data-source";
import { Logger } from "@nestjs/common";

// Function to run migrations
async function runMigrations() {
  const logger = new Logger("Migrations");

  try {
    // Initialize the data source
    await AppDataSource.initialize();
    logger.log("Data source has been initialized");

    // Run migrations
    const migrations = await AppDataSource.runMigrations();
    logger.log(`Successfully ran ${migrations.length} migrations`);

    // Close the connection
    await AppDataSource.destroy();
    logger.log("Data source has been closed");
  } catch (error) {
    logger.error("Error during migration process:", error);
    process.exit(1);
  }
}

// Run the migrations
const logger = new Logger("MigrationRunner");
runMigrations()
  .then(() => {
    logger.log("Migrations completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    logger.error("Failed to run migrations:", error);
    process.exit(1);
  });
