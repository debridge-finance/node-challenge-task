# TokenPrice Domain - Core Domain

## 🎯 Назначение

Core Domain для управления ценами токенов. Содержит всю бизнес-логику работы с ценами, источниками данных и расчетами.

## 📁 Структура домена

```
token-price/
├── entities/                    # Доменные сущности
│   ├── token.entity.ts         # Токен
│   ├── token-price.entity.ts   # Цена токена
│   ├── price-feed.entity.ts    # Источник цен
│   └── logo.entity.ts          # Логотип токена
├── services/                    # Доменные сервисы
│   ├── price-update.service.ts # Обновление цен
│   └── mock-price.service.ts   # Мок-сервис для генерации цен
├── repositories/                # Репозитории
│   └── token-price.repository.ts
└── token-price.module.ts       # Модуль домена
```

## 🏗️ Компоненты домена

### **Entities (Сущности)**

#### **Token**
- Основная сущность токена
- Содержит метаданные (symbol, name, decimals)
- Связь с PriceFeed и Logo

#### **TokenPrice**
- Исторические данные цен
- Связь с Token
- Временные метки

#### **PriceFeed**
- Источники ценовых данных
- Конфигурация API
- Приоритеты источников

### **Services (Сервисы)**

#### **PriceUpdateService**
- Обновление цен токенов каждые 5 секунд
- Проверка изменений цен
- Создание outbox событий для публикации

#### **MockPriceService**
- Генерация случайных цен для тестирования
- Имитация API источников цен
- Поддержка различных токенов

### **Repositories (Репозитории)**

#### **TokenPriceRepository**
- Доступ к данным цен
- Keyset pagination
- Оптимизированные запросы

## 🔧 Использование

### **Импорт домена**
```typescript
import { TokenPriceModule } from './domains/token-price/token-price.module';

@Module({
  imports: [TokenPriceModule],
})
export class AppModule {}
```

### **Использование сервисов**
```typescript
constructor(
  private readonly priceCalculation: PriceCalculationService,
  private readonly priceFeed: PriceFeedService,
  private readonly priceUpdate: PriceUpdateService,
) {}
```

### **Работа с сервисами**
```typescript
// Обновление цен
const result = await priceUpdateService.updateAllPrices();
console.log(`Updated ${result.updated} of ${result.total} tokens`);

// Генерация случайной цены
const price = await mockPriceService.getPrice('ETH');
```

### **Работа с репозиториями**
```typescript
// Регистрация источника
const config = new PriceFeedConfig('CoinGecko', 'https://api.coingecko.com/api/v3');
priceFeedService.registerPriceFeed('coingecko', config);

// Получение приоритетного источника
const primaryFeed = priceFeedService.getPrimaryPriceFeed();

// Получение цены из источника
const priceData = await priceFeedService.getTokenPriceFromFeed('coingecko', 'BTC');
```

## 🎯 Бизнес-логика

### **Обновление цен**
1. **Получение токенов** - батчевая загрузка активных токенов
2. **Выбор источника** - приоритетный источник цен
3. **Получение цены** - запрос к API источника
4. **Валидация** - проверка корректности цены
5. **Сравнение** - определение значимости изменения
6. **Сохранение** - запись в базу данных

### **Управление источниками**
1. **Регистрация** - добавление новых источников
2. **Приоритизация** - сортировка по важности
3. **Мониторинг** - проверка доступности
4. **Fallback** - переключение на резервные источники

### **Расчеты и аналитика**
1. **Валидация цен** - проверка корректности
2. **Расчет изменений** - процентные изменения
3. **Определение значимости** - пороговые значения
4. **Статистика** - средние значения, волатильность

## 📊 Метрики и мониторинг

### **Ключевые метрики**
- Количество обновлений цен
- Время выполнения операций
- Ошибки источников данных
- Доступность API

### **Алерты**
- Критические изменения цен
- Недоступность источников
- Высокая волатильность
- Ошибки валидации

## 🔒 Безопасность

### **Валидация данных**
- Проверка корректности цен
- Валидация URL источников
- Защита от некорректных данных

### **Ограничения**
- Минимальные/максимальные цены
- Таймауты запросов
- Rate limiting

## 🚀 Масштабирование

### **Производительность**
- Батчевая обработка
- Keyset pagination
- Кэширование источников

### **Надежность**
- Fallback источники
- Retry механизмы
- Graceful degradation

## 📝 Соглашения

### **Именование**
- **Entities**: `*.entity.ts`
- **Value Objects**: `*.value-object.ts`
- **Services**: `*.service.ts`
- **Repositories**: `*.repository.ts`

### **Принципы**
- **Инкапсуляция** - бизнес-логика в Value Objects
- **Изоляция** - четкие границы домена
- **Тестируемость** - легко тестируемые компоненты
- **Расширяемость** - простое добавление новых источников
