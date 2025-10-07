import { ConfigService } from "@nestjs/config";

/**
 * Безопасная утилита для получения обязательной конфигурации
 * Выбрасывает исключение если конфиг не найден
 */
export function getRequiredConfig<T>(configService: ConfigService, key: string): T {
  const config = configService.get<T>(key);

  if (!config) {
    throw new Error(
      `Required configuration "${key}" is missing. Please check your environment variables and config files.`
    );
  }

  return config;
}
