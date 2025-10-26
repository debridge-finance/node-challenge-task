import { Injectable } from '@nestjs/common';
import { Token } from '../models/token.entity';

@Injectable()
export class MockPriceService {
  async getRandomPriceForToken(token: Token): Promise<number> {
    // Имитация задержки вызова API
    await new Promise<void>(resolve => {
      setTimeout(() => {
        resolve();
      }, this.getRandomInt(50, 200));
    });

    // Генерация реалистичных изменений цен на основе текущей цены
    // Изменение цены от -5% до +5% от текущей цены
    // Fixed: PostgreSQL decimal returns as string, convert to number
    const currentPriceValue =
      typeof token.price === 'string' ? parseFloat(token.price) : token.price;
    const currentPrice = currentPriceValue || 1000; // если цена не установлена
    const changePercent = (Math.random() - 0.5) * 0.1; // -5% до +5%
    const newPrice = currentPrice * (1 + changePercent);

    // Цена всегда неотрицательная
    return Math.max(0, newPrice);
  }

  private getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
