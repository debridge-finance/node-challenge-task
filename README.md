# Token Price Service Challenge

This repository contains a Node.js challenge task implementing a Token Price Service with intentional anti-patterns and bugs for educational purposes.

## Project Structure

The repository is organized as follows:

```
src/
├── modules/                     # Business modules
│   ├── token-price/            # Core domain - Token price management
│   │   ├── entities/
│   │   ├── services/
│   │   └── repositories/
│   ├── infrastructure/         # Infrastructure services
│   │   ├── entities/
│   │   └── services/
│   ├── messaging/              # Message broker abstraction
│   └── health/                 # Health check module
│       ├── controllers/        # Health endpoints
│       ├── services/
│       └── dto/
├── shared/                      # Shared utilities
│   ├── config/
│   ├── controllers/            # Shared controllers (metrics)
│   ├── enums/
│   ├── metrics/
│   ├── filters/
│   └── utils/
├── data/                        # Database and seeding
├── migrations/                  # Database migrations
└── test/                        # Integration tests
```

## Technology Stack

- **Node.js**: JavaScript runtime
- **TypeScript**: For type safety
- **Nest.js**: Node.js framework for building efficient and scalable server-side applications
- **PostgreSQL**: For data storage
- **TypeORM**: For database interactions
- **Kafka.js**: For message brokering
- **Jest**: For testing
- **Testcontainers**: For integration testing with Docker containers

## Getting Started

### 1. Environment Setup

Create a `.env` file in the project root:

```bash
cp env.example.txt .env
```

Then edit `.env` with your configuration. See [env.example.txt](./env.example.txt) for all available variables and their defaults.

**Required variables:**
- `PG_HOST`, `PG_PORT`, `PG_USER`, `PG_PASSWORD`, `PG_DB` - PostgreSQL connection
- `REDIS_HOST`, `REDIS_PORT` - Redis connection
- `MESSAGING_BROKERS` - Kafka brokers

### 2. Database Setup

See [SEEDING.md](./SEEDING.md) for database migration and seeding instructions.

### 3. Monitoring (Optional)

See [MONITORING.md](./MONITORING.md) for Prometheus & Grafana setup.

## Features

- Token price updates with a mock price service
- Kafka integration for price update messages
- PostgreSQL database with denormalized structure
- Integration tests using Testcontainers

## License

This project is for educational purposes only.
