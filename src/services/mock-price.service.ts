import { Injectable, BadRequestException } from '@nestjs/common';
import { GetTokenPriceDto, GetTokenPriceDtoSchema } from '../dto/token.dto';
import { PriceService } from './price.service.interface';

@Injectable()
export class MockPriceService extends PriceService {
  async getRandomPriceForToken(tokenData: GetTokenPriceDto): Promise<number> {
    // Валидация входных данных с помощью Zod
    const validatedData = GetTokenPriceDtoSchema.parse(tokenData);
    
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
