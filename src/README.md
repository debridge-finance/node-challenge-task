# Token Price Service

A Node.js/TypeScript/Nest.js application that manages token metadata and price updates for various blockchain tokens.

## Project Overview

This service maintains information about various tokens (ERC20, Solana, BTC, etc.) across multiple blockchains using a normalized PostgreSQL database structure. It periodically updates token prices from a mock service and sends price change messages to Kafka before saving to the database.

## Database Structure

The application uses a normalized database with the following tables:
- **token**: Main token information with foreign keys to metadata, prices, logos, and chains
- **token_prices**: Token USD prices with update timestamps
- **token_metadata**: Token names and symbols
- **item_logo**: Logo image paths for tokens and chains
- **chain**: Blockchain/network information

All tables use `bigserial` primary keys and `snake_case` foreign key naming conventions.

## Features

- Uses PostgreSQL for token data storage with normalized schema
- Uses Kafka as a message broker for price update notifications
- Includes Testcontainers for integration testing with PostgreSQL and Kafka in Docker containers
- Periodically updates token prices from a mock service
- Sends price update messages to Kafka
- Supports multiple token sources (CoinGecko API, native tokens)

## Prerequisites

- Node.js (v18 or higher)
- Docker (for running tests with Testcontainers)
- PostgreSQL
- Kafka

## Running the Application

1. Make sure PostgreSQL is running on localhost:5432 with:
   - Database: tokens
   - Username: postgres
   - Password: postgres

2. Make sure Kafka is running on localhost:9092

3. Install dependencies:
   ```
   npm install
   ```

4. Run the application:
   ```
   npm start
   ```

## Running Tests

The integration tests use Testcontainers to spin up PostgreSQL and Kafka in Docker containers:

```
npm test
```

## Work with migrations

* If you need to create a new database migration after changes have been made to project entities, run:

```npm run typeorm:migration-generate ./datasource/migrations/NEW_MIGRATION_NAME```

For example: *npm run typeorm:migration-generate ./datasource/migrations/AddPostsStatus*

---

* When you need to apply these changes to the existing database, run:

```npm run typeorm:migration-run```

This command will connect to the database using the credentials from your environment variables
and update the current table structure according to the migrations list.

---

* In case you need to create empty migration file, just run command:

```npm run typeorm:migration-create```


## Project Structure

- **src/modules/**
  - **chains/**: Chain entities, repositories, and business logic
  - **chains-seed/**: Chain seeding services for database initialization
  - **tokens/**: Token entities and repositories
  - **tokens-metadata/**: Token metadata entities and placeholder services
  - **token-prices/**: Token price entities
  - **item-logo/**: Logo entities, repositories, and placeholder services
  - **tokens-invalidation/**: Token data invalidation and update logic
    - **metadata-invalidation/**: Token metadata invalidation services
      - **sources/coingecko-platforms/**: CoinGecko API integration
      - **sources/native-tokens/**: Native token seeding (BTC, ETH, SOL)
    - **prices-invalidation/**: Token price invalidation services
      - **sources/mock/**: Mock price service for testing
  - **kafka/**: Kafka producer service and message handling
  - **postgres/**: PostgreSQL database module configuration
- **src/common/**: Shared entities, types, constants, and helper libraries
- **src/config/**: Application configuration and environment schemas
- **datasource/**: Database ORM configuration and migrations
- **src/test/integration/**: Integration tests using Testcontainers
- **test/**: Jest test configuration
