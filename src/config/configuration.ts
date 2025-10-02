export default () => ({
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'tokens',
  },
  kafka: {
    brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
  },
  priceUpdate: {
    intervalSeconds: parseInt(process.env.PRICE_UPDATE_INTERVAL, 10) || 5,
    maxConcurrentUpdates: parseInt(process.env.MAX_CONCURRENT_UPDATES, 10) || 5,
  },
});