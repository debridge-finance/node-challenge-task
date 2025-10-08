import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Token } from './models/token.entity';
import { TokenPriceUpdateService } from './services/token-price-update.service';
import { MockPriceService } from './services/mock-price.service';
import { PriceService } from './services/price.service.interface';
import { KafkaProducerService } from './kafka/kafka-producer.service';
import { TokenSeeder } from './data/token.seeder';
import { AppInitializationService } from './services/app-initialization.service';
import { databaseConfig, kafkaConfig, appConfig } from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, kafkaConfig, appConfig],
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => configService.get('database'),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Token]),
  ],
  controllers: [],
  providers: [
    TokenPriceUpdateService,
    {
      provide: PriceService,
      useClass: MockPriceService,
    },
    KafkaProducerService,
    TokenSeeder,
    AppInitializationService,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(
    private readonly appInitializationService: AppInitializationService,
  ) {}

  async onModuleInit() {
    await this.appInitializationService.initialize();
  }
}
