export default () => ({
  clientId: process.env.KAFKA_CLIENT_ID || 'token-price-service',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(',').map(b => b.trim()),
  
  connectionTimeout: parseInt(process.env.KAFKA_CONNECTION_TIMEOUT || '60000', 10),
  requestTimeout: parseInt(process.env.KAFKA_REQUEST_TIMEOUT || '30000', 10),
  
  retry: {
    initialRetryTime: parseInt(process.env.KAFKA_INITIAL_RETRY_TIME || '100', 10),
    retries: parseInt(process.env.KAFKA_RETRIES || '8', 10)
  },
  
  producer: {
    allowAutoTopicCreation: process.env.KAFKA_AUTO_CREATE_TOPICS === 'true',
    transactionTimeout: parseInt(process.env.KAFKA_TRANSACTION_TIMEOUT || '60000', 10)
  },
  
  topics: {
    priceUpdates: process.env.KAFKA_TOPIC_PRICE_UPDATES || 'token-price-updates'
  }
})