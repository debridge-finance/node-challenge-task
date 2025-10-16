# Token Price Updater

A microservice-based application for updating token prices with a scheduler and updater service architecture. This project demonstrates a scalable approach to processing token price updates using Kafka for message brokering and PostgreSQL for data storage.

## Project Architecture

The application consists of two main services:

- **Scheduler Service**: Schedules and sends token batches for price updates
- **Updater Service**: Processes token batches and updates prices

## Technology Stack

- **Node.js**: JavaScript runtime
- **TypeScript**: For type safety
- **Nest.js**: Node.js framework for building efficient and scalable server-side applications
- **PostgreSQL**: For data storage
- **TypeORM**: For database interactions
- **Kafka**: For message brokering between services
- **Docker & Docker Compose**: For containerization and orchestration
- **Jest**: For testing

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)
- Docker and Docker Compose

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/token-price-updater.git
   cd token-price-updater
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the services using Docker Compose:

   ```bash
   docker-compose up -d
   ```

   This will start:
   - PostgreSQL database
   - Zookeeper
   - Kafka
   - Kafka UI (accessible at <http://localhost:8080>)
   - Scheduler service (accessible at <http://localhost:3002>)
   - Updater service (3 replicas)

4. To stop the services:

   ```bash
   docker-compose down
   ```

### Development

For local development:

1. Start the required infrastructure:

   ```bash
   docker-compose up -d postgres zookeeper kafka kafka-ui
   ```

2. Run the scheduler service:

   ```bash
   npm run start:dev -- --path apps/scheduler
   ```

3. Run the updater service:

   ```bash
   npm run start:dev -- --path apps/updater
   ```

### Testing

Run the end-to-end tests:

```bash
npm run test:e2e
```

## Features

- Token price updates with a mock price service
- Scheduled batch processing of tokens
- Kafka integration for message passing between services
- PostgreSQL database for token and feed storage
- Scalable architecture with multiple updater instances
- Exception handling and logging
- Health check endpoints

## Configuration

The application can be configured using environment variables:

### Scheduler Service

- `DATABASE_HOST`: PostgreSQL host
- `DATABASE_PORT`: PostgreSQL port
- `DATABASE_USERNAME`: PostgreSQL username
- `DATABASE_PASSWORD`: PostgreSQL password
- `DATABASE_NAME`: PostgreSQL database name
- `KAFKA_BROKERS`: Kafka broker addresses
- `PRICE_UPDATE_CRON`: Cron expression for scheduling updates (default: _/5_ \* \* \* \*)
- `PRICE_UPDATE_ENABLED`: Enable/disable scheduled updates
- `BATCH_SIZE`: Number of tokens to process in each batch

### Updater Service

- `DATABASE_HOST`: PostgreSQL host
- `DATABASE_PORT`: PostgreSQL port
- `DATABASE_USERNAME`: PostgreSQL username
- `DATABASE_PASSWORD`: PostgreSQL password
- `DATABASE_NAME`: PostgreSQL database name
- `KAFKA_BROKERS`: Kafka broker addresses

## License

This project is for educational purposes only.
