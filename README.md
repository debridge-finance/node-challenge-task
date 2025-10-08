# Token Price Service Challenge

This repository contains a Node.js challenge task implementing a Token Price Service with intentional anti-patterns and bugs for educational purposes.

## Project Structure

The repository is organized as follows:

- **src/**: The main project directory containing:
  - **data/**: Database context and seeder
  - **kafka/**: Kafka producer service
  - **migrations/**: Database migrations
  - **models/**: Token and message models
  - **services/**: Price update and mock services
  - **test/**: Integration tests

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

### Environment Configuration

1. Copy the example environment file:
   ```bash
   cp env.example .env
   ```

2. Update the `.env` file with your specific configuration values:
   - Database credentials
   - Kafka broker addresses
   - Application settings

3. Make sure your PostgreSQL and Kafka services are running (see docker-compose.yml)

### Running the Application

See the [src/README.md](./src/README.md) for detailed instructions on how to run the application and tests.

## Features

- Token price updates with a mock price service
- Kafka integration for price update messages
- PostgreSQL database with denormalized structure
- Integration tests using Testcontainers

## License

This project is for educational purposes only.

Изменения:

1. Добавил использование DI из Nest.js для price service, чтоб можно было инжектировать mock price service или реальную реализацию сервиса

2. добавил обработку ошибок в кафка сервис

3. перенес инициализацию в кафка сервисе из конструктора в onModuleInit

4. внедрил использование ConfigService из  Nest.js, чтоб не хардкодить,а использовать переменные окружения

5. Использовал DTO для Token, чтоб убрать прямое использование entity в сервисах и для валидации

6. добавил AppInitializationService, перенес туда код из app.module.ts для инициализации tokenSeed и TokenPriceUpdateService

7. в data/seed.ts использовал возможностей container box Nest.js для получения инстанса tokenSeeder, не передавая напрямую repository для Token

8. везде использовал конфиги из переменных окружения
