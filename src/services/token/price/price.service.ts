import { Injectable } from '@nestjs/common';
import { TokenEntity } from '@/models/token';

// ?: maybe we don't need a nest module here at all
@Injectable()
export class PriceService {
  public async getRandomPriceForToken(token: TokenEntity): Promise<number> {
    // Simulate API call delay
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, this.getRandomInt(50, 200));
    });

    const basePrice = this.getRandomInt(1, 100000);
    const randomFactor = Math.random() * 10;

    return basePrice * randomFactor;
  }

  private getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
