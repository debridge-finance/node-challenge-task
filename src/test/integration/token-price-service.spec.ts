import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GenericContainer, StartedTestContainer } from "testcontainers";
import { Token } from "../../modules/tokens/entities/token.entity";
import { TokenPrices } from "../../modules/token-prices/entity/token-prices.entity";
import { Chain } from "../../modules/chains/entities/chain.entity";
import { TokenMetadata } from "../../modules/tokens-metadata/entities/token-metadata.entity";
import { ItemLogo } from "../../modules/item-logo/entities/item-logo.entity";
import { TokenRepository } from "../../modules/tokens/repository/token.repository";
import { TokenPricesRepository } from "../../modules/token-prices/repository/token-prices.repository";
import { ChainRepository } from "../../modules/chains/repository/chain.repository";
import { TokenMetadataRepository } from "../../modules/tokens-metadata/repository/token-metadata.repository";
import { ItemLogoRepository } from "../../modules/item-logo/repository/item-logo.repository";
import { MockPriceService } from "../../modules/tokens-invalidation/prices-invalidation/sources/mock/services/mock-price.service";
import { PriceUpdateIntervalService } from "../../modules/tokens-invalidation/prices-invalidation/sources/mock/services/price-update-interval.service";
import { TokenPriceInvalidationService } from "../../modules/tokens-invalidation/prices-invalidation/sources/mock/services/token-price-invalidation.service";
import { TokenPriceKafkaService } from "../../modules/tokens-invalidation/prices-invalidation/services/token-price-kafka.service";
import { KafkaProducerService } from "../../modules/kafka/services/kafka-producer.service";
import { KafkaConnectionService } from "../../modules/kafka/services/kafka-connection.service";
import { CHAIN_SLUGS } from "../../modules/chains/libs/constants/chain-slugs.const";

describe("TokenPriceService Integration Tests", () => {
  let postgresContainer: StartedTestContainer;
  let moduleRef: TestingModule;
  let tokenRepository: TokenRepository;
  let chainRepository: ChainRepository;
  let tokenMetadataRepository: TokenMetadataRepository;
  let itemLogoRepository: ItemLogoRepository;
  let tokenPriceInvalidationService: TokenPriceInvalidationService;

  const testId = Math.random().toString(36).substring(7);

  beforeAll(async () => {
    jest.setTimeout(60000); // 1 minute timeout for container startup

    try {
      // Start PostgreSQL container
      postgresContainer = await new GenericContainer("postgres:15-alpine")
        .withName(`postgres-test-${testId}`)
        .withEnvironment({
          POSTGRES_USER: "testuser",
          POSTGRES_PASSWORD: "testpassword",
          POSTGRES_DB: "testdb",
        })
        .withExposedPorts(5432)
        .start();

      const postgresHost = postgresContainer.getHost();
      const mappedPostgresPort = postgresContainer.getMappedPort(5432);

      // Create NestJS test module
      moduleRef = await Test.createTestingModule({
        imports: [
          TypeOrmModule.forRoot({
            type: "postgres",
            host: postgresHost,
            port: mappedPostgresPort,
            username: "testuser",
            password: "testpassword",
            database: "testdb",
            entities: [Token, TokenPrices, Chain, TokenMetadata, ItemLogo],
            synchronize: true,
          }),
          TypeOrmModule.forFeature([
            Token,
            TokenPrices,
            Chain,
            TokenMetadata,
            ItemLogo,
          ]),
        ],
        providers: [
          TokenRepository,
          TokenPricesRepository,
          ChainRepository,
          TokenMetadataRepository,
          ItemLogoRepository,
          MockPriceService,
          TokenPriceKafkaService,
          TokenPriceInvalidationService,
          PriceUpdateIntervalService,
          {
            provide: KafkaProducerService,
            useValue: {
              sendMessage: jest
                .fn()
                .mockImplementation(() => Promise.resolve()),
              sendMessages: jest
                .fn()
                .mockImplementation(() => Promise.resolve()),
            },
          },
          {
            provide: KafkaConnectionService,
            useValue: {
              ensureTopicExists: jest
                .fn()
                .mockImplementation(() => Promise.resolve()),
              getProducer: jest.fn(),
            },
          },
        ],
      }).compile();

      tokenRepository = moduleRef.get<TokenRepository>(TokenRepository);
      chainRepository = moduleRef.get<ChainRepository>(ChainRepository);
      tokenMetadataRepository = moduleRef.get<TokenMetadataRepository>(
        TokenMetadataRepository
      );
      itemLogoRepository =
        moduleRef.get<ItemLogoRepository>(ItemLogoRepository);
      tokenPriceInvalidationService =
        moduleRef.get<TokenPriceInvalidationService>(
          TokenPriceInvalidationService
        );
    } catch (error) {
      console.error("Error during test setup:", error);
      throw error;
    }
  }, 60000);

  afterAll(async () => {
    if (moduleRef) {
      await moduleRef.close();
    }

    if (postgresContainer) {
      await postgresContainer.stop();
    }
  }, 30000);

  it("should update token price and send Kafka message", async () => {
    // Create required logo entity
    const logo = itemLogoRepository.create({
      big_relative_path: "/test/logo/big.png",
      small_relative_path: "/test/logo/small.png",
      thumb_relative_path: "/test/logo/thumb.png",
    });
    await itemLogoRepository.save(logo);

    // Create required chain entity
    const chain = chainRepository.create({
      name: "Ethereum",
      slug: CHAIN_SLUGS.ETHEREUM,
      is_enabled: true,
    });
    await chainRepository.save(chain);

    // Create required token metadata entity
    const metadata = tokenMetadataRepository.create({
      symbol: "TEST",
      name: "Test Token",
    });
    await tokenMetadataRepository.save(metadata);

    // Create test token with all required relations
    const token = tokenRepository.create({
      address: "0x0102030405060708090a0b0c0d0e0f1011121314",
      decimals: 18,
      is_native: false,
      is_protected: false,
      priority: 1,
      chain: chain,
      token_metadata: metadata,
      logo: logo,
    });

    await tokenRepository.save(token);

    // Get the mocked Kafka producer to spy on it
    const kafkaProducer =
      moduleRef.get<KafkaProducerService>(KafkaProducerService);

    // Manually trigger price invalidation (instead of waiting for interval)
    await tokenPriceInvalidationService.invalidatePrices();

    // Verify that KafkaProducerService.sendMessages was called
    expect(kafkaProducer.sendMessages).toHaveBeenCalled();
    
    // Verify the token now has a price
    const updatedTokens = await tokenRepository.find({
      where: { id: token.id },
      relations: ["token_price"],
    });
    expect(updatedTokens).toHaveLength(1);
    const updatedToken = updatedTokens[0];
    expect(updatedToken.token_price).toBeDefined();
    expect(updatedToken.token_price.usd_price).toBeDefined();
  }, 15000);
});
