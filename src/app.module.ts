import { Module, OnModuleInit } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Token } from "./models/token.entity";
import { TokenPriceUpdateService } from "./services/token-price-update.service";
import { MockPriceService } from "./services/mock-price.service";
import { KafkaProducerService } from "./kafka/kafka-producer.service";
import { TokenSeeder } from "./data/token.seeder";
import { getDataSourceOptions } from "./data/data-source";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env"],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        getDataSourceOptions(configService),
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
    private readonly tokenPriceUpdateService: TokenPriceUpdateService
  ) {}

  async onModuleInit() {
    try {
      // Seed initial data
      await this.tokenSeeder.seed();

      // Start price update service
      this.tokenPriceUpdateService.start();
    } catch (error) {
      console.error("Failed to initialize application:", error);
    }
  }
}
