import { Injectable } from "@nestjs/common";
import { Token } from "../entities/token.entity";

@Injectable()
export class MockPriceService {
  // API simulation constants - имитация задержки реального API
  private readonly MIN_API_DELAY_MS = 50;
  private readonly MAX_API_DELAY_MS = 200;

  // Price generation constants - диапазон генерации случайных цен
  private readonly MIN_BASE_PRICE = 1;
  private readonly MAX_BASE_PRICE = 100000;
  private readonly PRICE_VOLATILITY_FACTOR = 10;

  async getRandomPriceForToken(_token: Token): Promise<number> {
    await this.simulateApiDelay();

    return this.generateRandomPrice();
  }

  async getPrice(_symbol: string): Promise<number> {
    await this.simulateApiDelay();

    return this.generateRandomPrice();
  }

  private async simulateApiDelay(): Promise<void> {
    const delay = this.getRandomInt(this.MIN_API_DELAY_MS, this.MAX_API_DELAY_MS);
    await new Promise<void>((resolve) => setTimeout(resolve, delay));
  }

  private generateRandomPrice(): number {
    const basePrice = this.getRandomInt(this.MIN_BASE_PRICE, this.MAX_BASE_PRICE);
    const randomFactor = Math.random() * this.PRICE_VOLATILITY_FACTOR;

    return basePrice * randomFactor;
  }

  private getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
