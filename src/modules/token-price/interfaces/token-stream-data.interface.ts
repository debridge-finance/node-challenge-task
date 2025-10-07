import { Token } from "../entities/token.entity";

/**
 * Интерфейс для raw данных из TypeORM stream
 * Используется при обработке потока токенов
 */
export interface TokenStreamData {
  token: Token;
}
