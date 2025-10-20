import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ChainsSeederService } from "../../chains-seed/services/chains-seeder.service";
import { NativeTokensSeederService } from "../../tokens-invalidation/metadata-invalidation/sources/native-tokens/services/native-tokens-seeder.service";
import { InvalidateMetadataService } from "../../tokens-invalidation/metadata-invalidation/sources/coingecko-platforms/services/invalidate-metadata.service";
import { TokenPriceInvalidationService } from "../../tokens-invalidation/prices-invalidation/sources/mock/services/token-price-invalidation.service";
import { MetadataUpdateIntervalService } from "../../tokens-invalidation/metadata-invalidation/sources/coingecko-platforms/services/metadata-update-interval.service";
import { PriceUpdateIntervalService } from "../../tokens-invalidation/prices-invalidation/sources/mock/services/price-update-interval.service";

@Injectable()
export class AppInitializationOrchestratorService implements OnModuleInit {
  private readonly logger = new Logger(
    AppInitializationOrchestratorService.name
  );

  constructor(
    private readonly chainsSeederService: ChainsSeederService,
    private readonly nativeTokensSeederService: NativeTokensSeederService,
    private readonly invalidateMetadataService: InvalidateMetadataService,
    private readonly tokenPriceInvalidationService: TokenPriceInvalidationService,
    private readonly metadataUpdateIntervalService: MetadataUpdateIntervalService,
    private readonly priceUpdateIntervalService: PriceUpdateIntervalService
  ) {}

  async onModuleInit(): Promise<void> {
    this.logger.log("=== Starting Application Initialization ===");

    try {
      this.logger.log("Start. Chains seeded");
      await this.chainsSeederService.seedChains();
      this.logger.log("End. Chains seeded successfully");

      this.logger.log("Start. Seeding native tokens...");
      await this.nativeTokensSeederService.seedNativeTokens();
      this.logger.log("End. Native tokens seeded successfully");

      this.logger.log("Start. Loading tokens from CoinGecko...");
      await this.invalidateMetadataService.invalidateAll();
      this.logger.log("End. CoinGecko tokens loaded successfully");

      this.logger.log("Start. Initializing token prices...");
      await this.tokenPriceInvalidationService.invalidatePrices();
      this.logger.log("End. Token prices initialized successfully");

      this.logger.log("=== Application Initialization Complete ===");

      this.logger.log("Start. Periodic update services...");

      this.metadataUpdateIntervalService.start();
      this.priceUpdateIntervalService.start();

      this.logger.log("End. Periodic update services started");
    } catch (error) {
      this.logger.error(
        `Application initialization failed: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }
}
