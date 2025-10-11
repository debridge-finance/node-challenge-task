import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PriceModule } from '../price/price.module';
import { Token } from '../../models/token.entity';
import { TokenPriceUpdateService } from '../price/token-price-update.service';
import { MockPriceService } from '../price/mock-price.service';
import { KafkaProducerService } from '../kafka/kafka-producer.service';
import { TokenSeeder } from '../../data/token.seeder';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'tokens',
      entities: [Token],
      migrations: [__dirname + '/migrations/[0-9]*.{js,ts}'],
      migrationsRun: true, // Run migrations automatically
      synchronize: false, // Disabled when using migrations
    }),
    TypeOrmModule.forFeature([Token]),
    PriceModule,
  ],
  providers: [
    TokenSeeder,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(
    private readonly tokenSeeder: TokenSeeder,
    private readonly tokenPriceUpdateService: TokenPriceUpdateService,
  ) {}

  async onModuleInit() {
    try {
      // Seed initial data
      await this.tokenSeeder.seed(10000);
      
      // Start price update service
      this.tokenPriceUpdateService.start();
    } catch (error) {
      console.error('Failed to initialize application:', error);
    }
  }
}
