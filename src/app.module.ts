import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Token } from './models/token.entity';
import { TokenPriceUpdateService } from './services/token-price-update.service';
import { MockPriceService } from './services/mock-price.service';
import { KafkaProducerService } from './kafka/kafka-producer.service';
import { TokenSeeder } from './data/token.seeder';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USERNAME || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: process.env.DATABASE_NAME || 'tokens',
      entities: [Token],
      migrations: [__dirname + '/migrations/*.{js,ts}'],
      migrationsRun: true, // Run migrations automatically
      synchronize: false, // Disabled when using migrations
      ssl: false,
    }),
    TypeOrmModule.forFeature([Token]),
  ],
  controllers: [],
  providers: [TokenPriceUpdateService, MockPriceService, KafkaProducerService, TokenSeeder],
})
export class AppModule implements OnModuleInit {
  constructor(
    private readonly tokenSeeder: TokenSeeder,
    private readonly tokenPriceUpdateService: TokenPriceUpdateService,
  ) {}

  async onModuleInit() {
    try {
      // Seed initial data
      await this.tokenSeeder.seed();

      // Start price update service
      this.tokenPriceUpdateService.start();
    } catch (error) {
      console.error('Failed to initialize application:', error);
    }
  }
}
