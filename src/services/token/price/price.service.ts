import { setTimeout } from 'node:timers/promises';
import { Injectable } from '@nestjs/common';
import { TokenEntity } from '@/models/token';

// ?: maybe we don't need a nest module here at all
@Injectable()
export class PriceService {
  /**
   * @param tokens - array, because of multicall
   */
  public async getRandomPricesForTokens(
    tokens: TokenEntity[],
  ): Promise<number[]> {
    // Simulate API call delay
    await setTimeout(this.getRandomInt(50, 200));

    return tokens.map((t) => this.getRandomInt(1, 100000) * Math.random() * 10);
  }

  private getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
