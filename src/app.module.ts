import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      // NOTE: Выносим конфигурацию в .env, а лучше в свой ConfigService
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: parseInt(config.get('DB_PORT', '5432'), 10),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_DATABASE'),
        entities: [Token],
        migrations: [__dirname + '/migrations/*.{js,ts}'],
        migrationsRun: true, // Run migrations automatically
        synchronize: false, // Disabled when using migrations
      }),
    }),
    TypeOrmModule.forFeature([Token]),
  ],
  controllers: [],
  providers: [TokenPriceUpdateService, MockPriceService, KafkaProducerService, TokenSeeder],
})
export class AppModule implements OnModuleInit {
  constructor(
    private readonly tokenSeeder: TokenSeeder,
    private readonly tokenPriceUpdateService: TokenPriceUpdateService
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
