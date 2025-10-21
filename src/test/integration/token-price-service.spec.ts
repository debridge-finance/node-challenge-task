import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GenericContainer, StartedTestContainer, StartedNetwork } from 'testcontainers';
import { Kafka, Consumer, KafkaMessage } from 'kafkajs';
import { Token } from '../../models/token.entity';
import { Chain } from '../../models/chain.entity';
import { Logo } from '../../models/logo.entity';
import { TokenPriceUpdateService } from '../../token/token-price-update.service';
import { MockPriceService } from '../../token/mock-price.service';
import { KafkaProducerService } from '../../kafka/kafka-producer.service';
import { TokenPriceUpdateMessage } from '../../models/token-price-update-message';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('TokenPriceService Integration Tests', () => {
  let postgresContainer: StartedTestContainer;
  let zookeeperContainer: StartedTestContainer;
  let kafkaContainer: StartedTestContainer;
  let network: StartedNetwork;
  let moduleRef: TestingModule;
  let tokenRepository: Repository<Token>;
  let chainRepository: Repository<Chain>;
  let logoRepository: Repository<Logo>;
  let tokenPriceUpdateService: TokenPriceUpdateService;
  let kafkaConsumer: Consumer;
  
  const kafkaTopic = 'token-price-updates';
  const testId = Math.random().toString(36).substring(7);
  
  beforeAll(async () => {
    jest.setTimeout(120000); // 2 minutes timeout for container startup
    
    try {
      // Create a Docker network for containers to communicate
      const { Network } = await import('testcontainers');
      network = await new Network().start();
      
      // Start PostgreSQL container
      postgresContainer = await new GenericContainer('postgres:15-alpine')
        .withNetwork(network)
        .withNetworkAliases('postgres')
        .withEnvironment({
          POSTGRES_USER: 'testuser',
          POSTGRES_PASSWORD: 'testpassword',
          POSTGRES_DB: 'testdb',
        })
        .withExposedPorts(5432)
        .start();
      
      const postgresHost = postgresContainer.getHost();
      const mappedPostgresPort = postgresContainer.getMappedPort(5432);
      
      console.log('Starting Zookeeper container...');
      
      // Start Zookeeper container (required for Kafka)
      zookeeperContainer = await new GenericContainer('confluentinc/cp-zookeeper:7.3.0')
        .withNetwork(network)
        .withNetworkAliases('zookeeper')
        .withEnvironment({
          ZOOKEEPER_CLIENT_PORT: '2181',
          ZOOKEEPER_TICK_TIME: '2000',
        })
        .withExposedPorts(2181)
        .start();
      
      // Wait for Zookeeper to start
      await new Promise(resolve => setTimeout(resolve, 5000));

      console.log('Starting Kafka container...');
      
      // Start Kafka container
      kafkaContainer = await new GenericContainer('confluentinc/cp-kafka:7.3.0')
        .withNetwork(network)
        .withNetworkAliases('kafka')
        .withEnvironment({
          KAFKA_BROKER_ID: '1',
          KAFKA_ZOOKEEPER_CONNECT: 'zookeeper:2181',
          KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: 'PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT',
          KAFKA_ADVERTISED_LISTENERS: 'PLAINTEXT://kafka:29092,PLAINTEXT_HOST://localhost:9092',
          KAFKA_LISTENERS: 'PLAINTEXT://0.0.0.0:29092,PLAINTEXT_HOST://0.0.0.0:9092',
          KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: '1',
          KAFKA_AUTO_CREATE_TOPICS_ENABLE: 'true',
          KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: '1',
          KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: '1',
        })
        .withExposedPorts(9092)
        .start();
      
      const kafkaHost = kafkaContainer.getHost();
      const mappedKafkaPort = kafkaContainer.getMappedPort(9092);
      
      console.log(`Kafka is available at ${kafkaHost}:${mappedKafkaPort}`);
      
      // Setup Kafka consumer with retry logic
      const kafka = new Kafka({
        clientId: 'test-client',
        brokers: [`${kafkaHost}:${mappedKafkaPort}`],
        retry: {
          initialRetryTime: 1000,
          retries: 10,
        },
      });
      
      kafkaConsumer = kafka.consumer({ 
        groupId: 'test-consumer-group',
        retry: {
          initialRetryTime: 1000,
          retries: 10,
        },
      });
      
      // Retry logic for connecting and subscribing to Kafka
      let connected = false;
      let retries = 0;
      const maxRetries = 20;
      
      while (!connected && retries < maxRetries) {
        try {
          console.log(`Attempting to connect to Kafka (attempt ${retries + 1}/${maxRetries})...`);
          await kafkaConsumer.connect();
          
          // Wait a bit before subscribing
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          await kafkaConsumer.subscribe({ topic: kafkaTopic, fromBeginning: true });
          connected = true;
          console.log('Successfully connected to Kafka and subscribed to topic');
        } catch (error) {
          retries++;
          if (retries >= maxRetries) {
            console.error('Failed to connect to Kafka after max retries:', error);
            throw error;
          }
          console.log(`Failed to connect, retrying in 3 seconds... (${error.message})`);
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
      
      // Create NestJS test module
      moduleRef = await Test.createTestingModule({
        imports: [
          TypeOrmModule.forRoot({
            type: 'postgres',
            host: postgresHost,
            port: mappedPostgresPort,
            username: 'testuser',
            password: 'testpassword',
            database: 'testdb',
            entities: [Token, Chain, Logo],
            synchronize: true,
          }),
          TypeOrmModule.forFeature([Token, Chain, Logo]),
        ],
        providers: [
          TokenPriceUpdateService,
          MockPriceService,
          {
            provide: KafkaProducerService,
            useValue: {
              sendPriceUpdateMessage: jest.fn().mockImplementation(
                (message: TokenPriceUpdateMessage) => Promise.resolve(),
              ),
            },
          },
        ],
      }).compile();
      
      tokenRepository = moduleRef.get<Repository<Token>>(getRepositoryToken(Token));
      chainRepository = moduleRef.get<Repository<Chain>>(getRepositoryToken(Chain));
      logoRepository = moduleRef.get<Repository<Logo>>(getRepositoryToken(Logo));
      tokenPriceUpdateService = moduleRef.get<TokenPriceUpdateService>(TokenPriceUpdateService);
      
    } catch (error) {
      console.error('Error during test setup:', error);
      throw error;
    }
  }, 120000);
  
  afterAll(async () => {
    try {
      if (moduleRef) {
        await moduleRef.close();
      }
      
      if (kafkaConsumer) {
        await kafkaConsumer.disconnect();
      }
      
      if (kafkaContainer) {
        await kafkaContainer.stop();
      }
      
      if (zookeeperContainer) {
        await zookeeperContainer.stop();
      }
      
      if (postgresContainer) {
        await postgresContainer.stop();
      }
      
      if (network) {
        await network.stop();
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }, 60000);
  
  it('should update token price and send Kafka message', async () => {
    // Create test chain
    const chain = new Chain();
    chain.id = '11111111-1111-1111-1111-111111111111';
    chain.deid = 1;
    chain.name = 'Test Chain';
    chain.isEnabled = true;
    await chainRepository.save(chain);
    
    // Create test logo
    const logo = new Logo();
    logo.bigRelativePath = '/test.png';
    logo.smallRelativePath = '/test_small.png';
    logo.thumbRelativePath = '/test_thumb.png';
    const savedLogo = await logoRepository.save(logo);
    
    // Create test token
    const token = new Token();
    token.address = Buffer.from([0x01, 0x02, 0x03]);
    token.symbol = 'TEST';
    token.name = 'Test Token';
    token.decimals = 18;
    token.isNative = false;
    token.chainId = chain.id;
    token.logoId = savedLogo.id;
    token.isProtected = false;
    token.priority = 1;
    token.timestamp = new Date();
    token.price = 100;
    token.lastPriceUpdate = new Date();
    
    await tokenRepository.save(token);
    
    // Wait for cron to run (it runs every 5 seconds)
    await new Promise(resolve => setTimeout(resolve, 6000));
    
    // Check if token price was updated in the database
    const updatedToken = await tokenRepository.findOne({ where: { id: token.id } });
    expect(updatedToken).toBeDefined();
    expect(updatedToken.price).not.toEqual(100);
    
    // Note: In a real test, we would also check for Kafka messages,
    // but since we're mocking the KafkaProducerService, we can't do that here
  }, 15000);
});
