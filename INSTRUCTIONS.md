# Token Price Service - Running Instructions

This document provides instructions on how to run the Token Price Service application.

## Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose

## Running with Docker Compose

The easiest way to run the application is to use Docker Compose for the dependencies (PostgreSQL and Kafka):

1. Start the dependencies:

```bash
docker compose up -d
```

2. Install the Node.js dependencies:

```bash
npm install
```

3. Run the application:

```bash
npm start
```

## Running the Tests

The integration tests use Testcontainers to spin up PostgreSQL and Kafka in Docker containers:

```bash
npm test
```

## Stopping the Application

1. Press `Ctrl+C` to stop the Node.js application

2. Stop the Docker containers:

```bash
docker compose down
```

## Cleaning Up

To remove all data volumes:

```bash
docker compose down -v
```

## Project Structure

- **src/models/**: Contains the Token and TokenPriceUpdateMessage classes
- **src/data/**: Contains the database context and seeder
- **src/services/**: Contains the MockPriceService and TokenPriceUpdateService
- **src/kafka/**: Contains the KafkaService
- **src/migrations/**: Contains database migrations
- **src/test/**: Contains integration tests using Testcontainers
