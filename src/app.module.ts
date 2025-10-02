import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Token } from './models/token.entity';
import { TokenPriceUpdateService } from './services/token-price-update.service';
import { MockPriceService } from './services/mock-price.service';
import { KafkaProducerService } from './kafka/kafka-producer.service';
import { TokenSeeder } from './data/token.seeder';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [Token],
        migrations: [__dirname + '/migrations/*.{js,ts}'],
        migrationsRun: true, // Run migrations automatically
        synchronize: false, // Disabled when using migrations
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Token]),
  ],
  controllers: [],
  providers: [
    TokenPriceUpdateService,
    MockPriceService,
    KafkaProducerService,
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
      await this.tokenSeeder.seed();
      
      // Start price update service
      this.tokenPriceUpdateService.start();
    } catch (error) {
      console.error('Failed to initialize application:', error);
    }
  }
}
