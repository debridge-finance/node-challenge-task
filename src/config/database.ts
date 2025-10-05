export default () => {
  const isProduction = process.env.NODE_ENV === 'production'
  const isTesting = process.env.NODE_ENV === 'test'
  
  return {
    type: 'postgres' as const,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'tokens',
    
    // Never sync in production
    synchronize: false,
    
    // Logging
    logging: process.env.DB_LOGGING === 'true' || (!isProduction && !isTesting),
    
    // Connection pool
    poolSize: parseInt(process.env.DB_POOL_SIZE || '10', 10),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '60000', 10),
    
    // SSL for production
    ssl: isProduction && process.env.DB_SSL === 'true' 
      ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' }
      : false
  }
}