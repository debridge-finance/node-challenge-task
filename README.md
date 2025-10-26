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

## Features

- Token price updates with a mock price service
- Kafka integration for price update messages
- PostgreSQL database with denormalized structure
- Integration tests using Testcontainers

## Getting Started

**Установить зависимости используя NPM**
```bash
npm i
```

**Создать `.env` файл (пример в env-example)**
**Запустить весь проект одной командой:**

```bash
docker compose up -d
```

**Testing**

Run integration tests:

```bash
npm test
```

## Code Quality

The project uses ESLint and Prettier for code quality and consistency:

```bash
# Format code
npm run format

# Lint and auto-fix
npm run lint

# Build project
npm run build
```

### 🔴 Критические баги исправлены:

1. ✅ **Error handling** - добавлен `process.exit(1)` при критических ошибках старта
2. ✅ **Async/await в Kafka** - добавлен `await` перед `producer.send()` (критический!)
3. ✅ **Поглощение ошибок** - удалены try-catch блоки, которые скрывали проблемы
4. ✅ **Connect() в конструкторе** - перенесен в `OnModuleInit` lifecycle hook
5. ✅ **PostgreSQL decimal type** - исправлена конвертация string → number
6. ✅ **Auto-executing migrations** - исправлен паттерн загрузки файлов

### ⚡ Оптимизация производительности:

1. ✅ **Параллельная обработка токенов** - вместо последовательной (for...of → Promise.all)
2. ✅ **Concurrency control** - ограничение до 5 одновременных запросов
   - Собственная реализация очереди без внешних зависимостей
   - Защита от перегрузки БД и Kafka
   - Оптимальное использование ресурсов

### 🔧 Устранены антипаттерны:

1. ✅ **Environment variables** - все credentials вынесены из кода
2. ✅ **Built-in crypto.randomUUID()** - вместо кастомной реализации
3. ✅ **Реалистичная генерация цен** - изменения ±5% от текущей цены
4. ✅ **ConfigService pattern** - централизованная конфигурация с Zod валидацией

### 🐳 Docker & Infrastructure:

1. ✅ **Multi-stage Dockerfile** - оптимизированный размер образа (~270MB)
2. ✅ **Health checks** - для всех 4 сервисов (PostgreSQL, Zookeeper, Kafka, App)
3. ✅ **Smart dependencies** - сервисы запускаются только после готовности зависимостей
4. ✅ **Production-ready** - non-root user, isolated network, volumes

### 🔐 Безопасность:

1. ✅ **npm audit fix** - исправлены все критические уязвимости в зависимостях
2. ✅ **Environment-based secrets** - пароли не в коде
3. ✅ **Non-root Docker user** - повышенная безопасность контейнера
4. ✅ **Input validation** - Zod schemas для всех данных

### ✨ Дополнительные улучшения:

1. ✅ **ESLint + Prettier** - настроены и работают (0 errors, 0 warnings)
2. ✅ **Graceful shutdown** - корректное завершение работы
3. ✅ **Improved logging** - структурированное логирование с stack traces
4. ✅ **TypeScript strict mode** - строгая типизация

## License

This project is for educational purposes only.
