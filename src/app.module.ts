import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Token } from './models/token.entity';
import { Chain } from './models/chain.entity';
import { Logo } from './models/logo.entity';
import { OutboxEvent } from './models/outbox-event.entity';
import { TokenPriceUpdateService } from './services/token-price-update.service';
import { MockPriceService } from './services/mock-price.service';
import { KafkaProducerService } from './kafka/kafka-producer.service';
import { TokenSeeder } from './data/token.seeder';
import { TokenService } from './services/token.service';
import { TokenMapper } from './services/dto/token.mapper';
import configuration from './config';
import { configProviders } from './providers/config.providers';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      cache: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'),
        entities: [Token, Chain, Logo, OutboxEvent],
      }),
    }),
    TypeOrmModule.forFeature([Token, Chain, Logo, OutboxEvent]),
  ],
  controllers: [],
  providers: [
    ...configProviders,
    KafkaProducerService,
    TokenPriceUpdateService,
    MockPriceService,
    TokenSeeder,
    TokenService,
    TokenMapper,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,
    private readonly tokenSeeder: TokenSeeder,
    private readonly tokenPriceUpdateService: TokenPriceUpdateService,
  ) {}

  async onModuleInit() {
    try {
      const appConfig = this.configService.get('app');
      
      // Only seed if configured
      if (appConfig.seed.autoSeed) {
        await this.tokenSeeder.seed();
      }
      
      // Start price update service
      this.tokenPriceUpdateService.start();
    } catch (error) {
      console.error('Failed to initialize application:', error);
      if (this.configService.get('app.isProduction')) {
        process.exit(1);
      }
    }
  }
}
