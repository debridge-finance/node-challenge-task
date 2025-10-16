import {
  GenericContainer,
  Network,
  StartedNetwork,
  StartedTestContainer,
  Wait,
} from 'testcontainers';
import { setTimeout } from 'timers/promises';
import { Client as PgClient } from 'pg';
import { exec } from 'child_process';
import { promisify } from 'util';

const TEST_TIMEOUT = 120000;

describe('Token Price Service E2E', () => {
  let network: StartedNetwork;
  let postgresContainer: StartedTestContainer;
  let zookeeperContainer: StartedTestContainer;
  let kafkaContainer: StartedTestContainer;

  let schedulerContainer: StartedTestContainer;
  let updaterContainer: StartedTestContainer;

  let pgClient: PgClient;

  let initialTokens: any[] = [];

  beforeAll(async () => {
    try {
      console.log('Starting test setup...');

      console.log('Creating network...');
      network = await new Network().start();
      console.log(`Network created with ID: ${network.getId()}`);

      console.log('Starting PostgreSQL container...');
      postgresContainer = await new GenericContainer('postgres:15-alpine')
        .withNetwork(network)
        .withNetworkAliases('postgres')
        .withName('e2e-postgres')
        .withEnvironment({
          POSTGRES_USER: 'postgres',
          POSTGRES_PASSWORD: 'postgres',
          POSTGRES_DB: 'tokens',
        })
        .withExposedPorts(5432)
        .withWaitStrategy(Wait.forLogMessage('database system is ready to accept connections'))
        .withStartupTimeout(60000)
        .start();

      console.log('Initializing database connection...');
      let retries = 5;
      let connected = false;

      while (retries > 0 && !connected) {
        try {
          pgClient = new PgClient({
            host: postgresContainer.getHost(),
            port: postgresContainer.getMappedPort(5432),
            user: 'postgres',
            password: 'postgres',
            database: 'tokens',
          });

          await pgClient.connect();
          connected = true;
          console.log('Database connection established successfully');
        } catch (error) {
          console.error(`Database connection attempt failed (${retries} retries left):`, error);

          if (pgClient) {
            try {
              await pgClient.end().catch(() => {});
            } catch (e) {}
          }

          retries--;

          if (retries > 0) {
            console.log('Waiting 5 seconds before retrying...');
            await setTimeout(5000);
          } else {
            throw new Error(
              `Failed to connect to database after multiple attempts: ${error.message}`,
            );
          }
        }
      }

      console.log('Starting Zookeeper container...');
      zookeeperContainer = await new GenericContainer('confluentinc/cp-zookeeper:7.3.0')
        .withNetwork(network)
        .withNetworkAliases('zookeeper')
        .withName('e2e-zookeeper')
        .withEnvironment({
          ZOOKEEPER_CLIENT_PORT: '2181',
          ZOOKEEPER_TICK_TIME: '2000',
        })
        .withExposedPorts(2181)
        .withWaitStrategy(Wait.forLogMessage('Started'))
        .withStartupTimeout(60000)
        .start();

      console.log('Starting Kafka container...');
      kafkaContainer = await new GenericContainer('confluentinc/cp-kafka:7.3.0')
        .withNetwork(network)
        .withNetworkAliases('kafka')
        .withName('e2e-kafka')
        .withEnvironment({
          KAFKA_BROKER_ID: '1',
          KAFKA_ZOOKEEPER_CONNECT: 'zookeeper:2181',
          KAFKA_ADVERTISED_LISTENERS: 'PLAINTEXT://kafka:9093,PLAINTEXT_HOST://localhost:9092',
          KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: 'PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT',
          KAFKA_INTER_BROKER_LISTENER_NAME: 'PLAINTEXT',
          KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: '1',
          KAFKA_AUTO_CREATE_TOPICS_ENABLE: 'true',
        })
        .withExposedPorts(9092, 9093)
        .withWaitStrategy(Wait.forLogMessage('started'))
        .withStartupTimeout(60000)
        .start();

      console.log('Waiting for Kafka to be fully ready...');
      await setTimeout(10000);

      console.log('Building and starting application containers...');

      const execPromise = promisify(exec);

      console.log('Building scheduler Docker image...');
      await execPromise(
        'docker build -t token-scheduler-service:test -f apps/scheduler/Dockerfile .',
      );

      console.log('Building updater Docker image...');
      await execPromise('docker build -t token-updater-service:test -f apps/updater/Dockerfile .');

      const commonEnv = {
        DATABASE_HOST: 'postgres',
        DATABASE_PORT: '5432',
        DATABASE_USERNAME: 'postgres',
        DATABASE_PASSWORD: 'postgres',
        DATABASE_NAME: 'tokens',
        KAFKA_BROKERS: 'kafka:9093',
        PRICE_UPDATE_CRON: '*/1 * * * * *',
        PRICE_UPDATE_ENABLED: 'true',
        BATCH_SIZE: '2',
      };

      console.log('Starting scheduler container...');
      schedulerContainer = await new GenericContainer('token-scheduler-service:test')
        .withNetworkMode(network.getName())
        .withNetworkAliases('scheduler')
        .withName('e2e-scheduler')
        .withExposedPorts(3002)
        .withEnvironment(commonEnv)
        .withStartupTimeout(60000)
        .withWaitStrategy(Wait.forLogMessage('Token Scheduler Service is running on port 3002'))
        .start();

      console.log('Starting updater container...');
      updaterContainer = await new GenericContainer('token-updater-service:test')
        .withNetworkMode(network.getName())
        .withNetworkAliases('updater')
        .withName('e2e-updater')
        .withExposedPorts(3001)
        .withEnvironment(commonEnv)
        .withStartupTimeout(60000)
        .withWaitStrategy(Wait.forLogMessage('Token Updater Service is running on port 3001'))
        .start();

      console.log('Waiting for applications to start...');
      await setTimeout(5000);

      const result = await pgClient.query('SELECT id, price FROM tokens');
      initialTokens = result.rows;
      console.log(`Found ${initialTokens.length} tokens in database with initial prices`);

      console.log('Test setup completed successfully');
    } catch (error) {
      console.error('Error in test setup:', error);
      await cleanup();
      throw error;
    }
  }, TEST_TIMEOUT);

  async function cleanup() {
    try {
      console.log('Cleaning up resources...');

      if (schedulerContainer) {
        await schedulerContainer
          .stop()
          .catch((err) => console.error('Error stopping scheduler container:', err));
        console.log('Scheduler container stopped');
      }

      if (updaterContainer) {
        await updaterContainer
          .stop()
          .catch((err) => console.error('Error stopping updater container:', err));
        console.log('Updater container stopped');
      }

      if (pgClient) {
        await pgClient
          .end()
          .catch((err) => console.error('Error closing database connection:', err));
      }

      if (postgresContainer) {
        await postgresContainer
          .stop()
          .catch((err) => console.error('Error stopping Postgres container:', err));
      }

      if (zookeeperContainer) {
        await zookeeperContainer
          .stop()
          .catch((err) => console.error('Error stopping Zookeeper container:', err));
      }

      if (kafkaContainer) {
        await kafkaContainer
          .stop()
          .catch((err) => console.error('Error stopping Kafka container:', err));
      }

      if (network) {
        await network.stop().catch((err) => console.error('Error stopping network:', err));
      }
    } catch (error) {
      console.error('Error in cleanup:', error);
    }
  }

  afterAll(async () => {
    console.log('Running test cleanup...');
    await cleanup();
    console.log('Test cleanup completed');
  });

  it(
    'should update token prices and send messages to Kafka',
    async () => {
      try {
        console.log('Starting test execution...');

        console.log('Waiting for token processing (30 seconds)...');
        await setTimeout(30000);

        console.log('Checking token prices in database...');
        const result = await pgClient.query('SELECT id, price FROM tokens');
        const updatedTokens = result.rows;

        console.log(`Found ${updatedTokens.length} tokens in database after processing`);

        for (const token of updatedTokens) {
          const originalToken = initialTokens.find((t) => t.id === token.id);
          if (!originalToken) {
            console.warn(`Could not find original token with ID ${token.id}`);
            continue;
          }

          console.log(
            `Token ${token.id}: Original price = ${originalToken.price}, New price = ${token.price}`,
          );
          expect(Number(token.price)).not.toEqual(Number(originalToken.price));
        }

        console.log('Checking feed table for processed entries...');
        const feedResult = await pgClient.query("SELECT * FROM feed WHERE status = 'processed'");
        console.log(`Found ${feedResult.rows.length} processed feed entries`);
        expect(feedResult.rows.length).toBeGreaterThan(0);

        console.log('Test execution completed successfully');
      } catch (error) {
        console.error('Error in test execution:', error);
        throw error;
      }
    },
    TEST_TIMEOUT,
  );
});
