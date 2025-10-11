import { Module, OnApplicationBootstrap } from "@nestjs/common";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { PriceModule } from "../price/price.module";
import { Token } from "../../models/token.entity";
import { TokenPriceUpdateService } from "../price/token-price-update.service";
import { TokenSeeder } from "../../data/token.seeder";
import databaseConfig from "../../config/database.config";
import kafkaConfig from "../../config/kafka.config";
import priceConfig from "../../config/price.config";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig, kafkaConfig, priceConfig],
      isGlobal: true,
      cache: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [databaseConfig.KEY],
      useFactory: (dbConfig: TypeOrmModuleOptions) => dbConfig,
    }),
    TypeOrmModule.forFeature([Token]),
    PriceModule,
  ],
  providers: [TokenSeeder],
})
export class AppModule implements OnApplicationBootstrap {
  constructor(
    private readonly tokenSeeder: TokenSeeder,
    private readonly tokenPriceUpdateService: TokenPriceUpdateService
  ) {}

  async onApplicationBootstrap() {
    try {
      // Seed initial data
      await this.tokenSeeder.seed(10000);

      // Start price update service
      this.tokenPriceUpdateService.start();
    } catch (error) {
      console.error("Failed to initialize application:", error);
      throw error;
    }
  }
}
