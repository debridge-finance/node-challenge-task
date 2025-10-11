import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { GenericContainer, StartedTestContainer, Network, StartedNetwork } from 'testcontainers';
import { Kafka, KafkaConfig, KafkaMessage, Consumer, logLevel } from 'kafkajs';
import { getPort } from 'portfinder';
import { Token } from '../../models/token.entity';
import { TokenPriceUpdateService } from '../../modules/price/token-price-update.service';
import { MockPriceService } from '../../modules/price/mock-price.service';
import { KafkaProducerService } from '../../modules/kafka/kafka-producer.service';
// import { TokenPriceUpdateMessage } from '../../models/token-price-update-message';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import priceConfigFactory from '../../config/price.config';
import kafkaConfigFactory from '../../config/kafka.config';
import { getRandomString } from '../../utils/random';


describe('TokenPriceService Integration Tests', () => {
  let network: StartedNetwork;
  let postgresContainer: StartedTestContainer;
  let zookeeperContainer: StartedTestContainer;
  let kafkaContainer: StartedTestContainer;
  let moduleRef: TestingModule;
  let tokenRepository: Repository<Token>;
  let tokenPriceUpdateService: TokenPriceUpdateService;
  let kafkaConsumer: Consumer;
  
  let databaseConfig: TypeOrmModuleOptions;
  let kafkaConfig: KafkaConfig;

  const testId = getRandomString();
  
  beforeAll(async () => {
    jest.setTimeout(120000); // 2 minutes timeout for container startup
    
    try {
      databaseConfig = {
        type: 'postgres',
        username: 'testuser',
        password: 'testpassword',
        database: 'testdb',
        entities: [__dirname + '/../../models/*.entity{.ts,.js}'],
        synchronize: true, // Always true for tests
        logging: false, // Disable logging in tests
        dropSchema: true, // Clean database between tests
      }
      
      network = await new Network().start();
      
      // Start PostgreSQL container
      postgresContainer = await new GenericContainer('postgres:15-alpine')
        .withName(`postgres-test-${testId}`)
        .withEnvironment({
          POSTGRES_USER: databaseConfig.username!,
          POSTGRES_PASSWORD: databaseConfig.password as string,
          POSTGRES_DB: databaseConfig.database!,
        })
        .withExposedPorts(5432)
        .start();

      databaseConfig = {
        ...databaseConfig,
        host: postgresContainer.getHost(),
        port: postgresContainer.getMappedPort(5432),
      }
      
      // Start Zookeeper container (required for Kafka)
      zookeeperContainer = await new GenericContainer('confluentinc/cp-zookeeper:7.3.0')
        .withName(`zookeeper-test-${testId}`)
        .withEnvironment({
          ZOOKEEPER_CLIENT_PORT: '2181',
          ZOOKEEPER_TICK_TIME: '2000',
        })
        .withNetwork(network)
        .withNetworkAliases("zookeeper")
        .withExposedPorts(2181)
        .start();
      
      // Wait for Zookeeper to start
      await new Promise(resolve => setTimeout(resolve, 3000));

      const mappedKafkaPort = await getPort({});

      // Start Kafka container
      kafkaContainer = await new GenericContainer('confluentinc/cp-kafka:7.3.0')
        .withName(`kafka-test-${testId}`)
        .withEnvironment({
          KAFKA_BROKER_ID: '1',
          KAFKA_ZOOKEEPER_CONNECT: 'zookeeper:2181',
          KAFKA_LISTENERS: `PLAINTEXT://0.0.0.0:${mappedKafkaPort}`,
          KAFKA_ADVERTISED_LISTENERS: `PLAINTEXT://localhost:${mappedKafkaPort}`,
          KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: '1',
          KAFKA_AUTO_CREATE_TOPICS_ENABLE: 'true',
        })
        .withNetwork(network)
        .withExposedPorts({
          container: mappedKafkaPort,
          host: mappedKafkaPort
        })
        .start();

      const kafkaHost = kafkaContainer.getHost();
      
      // Wait for Kafka to be fully ready
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Setup Kafka consumer
      kafkaConfig = {
        clientId: 'test-client',
        brokers: [`${kafkaHost}:${mappedKafkaPort}`],
        logLevel: logLevel.NOTHING,
        retry: {
          initialRetryTime: 500,
          retries: 3, // Fewer retries for tests
        },
        requestTimeout: 10000, // Shorter timeout for tests
        connectionTimeout: 1000,
      }
      const kafka = new Kafka(kafkaConfig);
      
      kafkaConsumer = kafka.consumer({ groupId: 'test-consumer-group' });
      await kafkaConsumer.connect();
      await kafkaConsumer.subscribe({ topic: KafkaProducerService.topic, fromBeginning: true });
      
      // Create NestJS test module
      moduleRef = await Test.createTestingModule({
        imports: [
          TypeOrmModule.forRoot(databaseConfig),
          TypeOrmModule.forFeature([Token]),
        ],
        providers: [
          TokenPriceUpdateService,
          MockPriceService,
          KafkaProducerService,
          {
            provide: kafkaConfigFactory.KEY,
            useValue: kafkaConfig,
          },
          {
            provide: priceConfigFactory.KEY,
            useValue: priceConfigFactory(),
          },
        ],
      }).compile();
      
      tokenRepository = moduleRef.get(getRepositoryToken(Token));
      tokenPriceUpdateService = moduleRef.get(TokenPriceUpdateService);
      
      await moduleRef.init();

    } catch (error) {
      console.error('Error during test setup:', error);
      throw error;
    }
  }, 120000);
  
  afterAll(async () => {
    if (tokenPriceUpdateService) {
      await tokenPriceUpdateService.stop();
    }

    if (moduleRef) {
      await moduleRef.close();
    }
    
    if (kafkaConsumer) {
      await kafkaConsumer.stop();
      await kafkaConsumer.disconnect();
    }
    
    if (postgresContainer) {
      await postgresContainer.stop();
    }
    
    if (kafkaContainer) {
      await kafkaContainer.stop();
    }
    
    if (zookeeperContainer) {
      await zookeeperContainer.stop();
    }

    if (network) {
      await network.stop();
    }
  }, 30000);
  
  it('should update token price and send Kafka message', async () => {
    // Create test token
    const token = new Token();
    token.address = Buffer.from([0x01, 0x02, 0x03]);
    token.symbol = 'TEST';
    token.name = 'Test Token';
    token.decimals = 18;
    token.isNative = false;
    token.chainId = '11111111-1111-1111-1111-111111111111';
    token.isProtected = false;
    token.priority = 1;
    token.timestamp = new Date();
    token.chain_DeId = 1;
    token.chain_Name = 'Test Chain';
    token.chain_IsEnabled = true;
    token.logo_Id = '22222222-2222-2222-2222-222222222222';
    token.logo_TokenId = '33333333-3333-3333-3333-333333333333';
    token.logo_BigRelativePath = '/test.png';
    token.logo_SmallRelativePath = '/test_small.png';
    token.logo_ThumbRelativePath = '/test_thumb.png';
    token.price = 100;
    token.lastPriceUpdate = new Date();
    
    await tokenRepository.save(token);

    let messages: KafkaMessage[] = [];

    await kafkaConsumer.run({
      eachMessage: async (payload: {message: KafkaMessage}): Promise<void> => {
        messages.push(payload.message);
      }
    })
    
    // Start price update service
    tokenPriceUpdateService.start();
    
    // Wait for price updates to occur
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Stop the service
    await tokenPriceUpdateService.stop();
    await kafkaConsumer.stop();
    
    // Check if token price was updated in the database
    const updatedToken = await tokenRepository.findOne({ where: { id: token.id } });
    expect(updatedToken).toBeDefined();
    expect(updatedToken?.price).not.toEqual(100);

    const { key, value } = messages[messages.length - 1] || {};
    expect(key?.toString()).toBe(token.id);
    const valueParsed: {
      tokenId?: string;
      symbol?: string;
      oldPrice?: number;
      newPrice?: number;
      timestamp?: string;
    } = JSON.parse(value?.toString() || '{}');
    
    expect(valueParsed.tokenId).toBe(token.id);
    expect(valueParsed.newPrice).toBe(updatedToken?.price);
    expect(new Date(valueParsed.timestamp || 0)).toStrictEqual(updatedToken?.lastPriceUpdate);
  }, 10000);
});
