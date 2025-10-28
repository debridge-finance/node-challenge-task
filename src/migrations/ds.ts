//import { DataSource } from 'typeorm';
//import { InitialMigration1684654321000 } from '../migrations/1684654321000-InitialMigration';
//import { Token } from '../models/token.entity';

import { DataSource } from 'typeorm';
import { InitialMigration1684654321000 } from './1684654321000-InitialMigration';
import { NormalizeChains1761591992397 } from './1761591992397-NormalizeChains';
import { NormalizeLogos1761591998247 } from './1761591998247-NormalizeLogos';
import { NormalizePrices1761592045949 } from './1761592045949-NormalizePrices';
import { CleanTokens1761592080369 } from './1761592080369-CleanTokens';
import { pgConfig } from '../../src/config';

export default new DataSource({
  ...pgConfig(),
  migrations: [
    InitialMigration1684654321000,
    NormalizeChains1761591992397,
    NormalizeLogos1761591998247,
    NormalizePrices1761592045949,
    CleanTokens1761592080369,
  ],
  synchronize: false,
  logging: ['error'],
  // TODO: switch to structured
  logger: 'advanced-console',
  maxQueryExecutionTime: 120_000,
});

//// Function to run migrations
//async function runMigrations() {
//  try {
//    // Initialize the data source
//    await AppDataSource.initialize();
//    console.log('Data source has been initialized');
//
//    // Run migrations
//    const migrations = await AppDataSource.runMigrations();
//    console.log(`Successfully ran ${migrations.length} migrations`);
//
//    // Close the connection
//    await AppDataSource.destroy();
//    console.log('Data source has been closed');
//  } catch (error) {
//    console.error('Error during migration process:', error);
//    process.exit(1);
//  }
//}
//
//// Run the migrations
//runMigrations()
//  .then(() => {
//    console.log('Migrations completed successfully');
//    process.exit(0);
//  })
//  .catch((error) => {
//    console.error('Failed to run migrations:', error);
//    process.exit(1);
//  });
