import { Injectable, Inject } from '@nestjs/common';
import { Token } from '../models/token.entity';
import { INJECT_TOKENS } from '../utils/injectTokens';
import { PriceRequestDto, PriceResponseDto } from './dto/price.dto';
import { TokenDto } from './dto/token.dto';
import { MockPriceServiceConfig } from './types';

@Injectable()
export class MockPriceService {
  
  async getPriceForTokenDto(tokenDto: PriceRequestDto): Promise<PriceResponseDto> {
    // Simulate API call delay only if enabled
    if (this.config.enableDelay) {
      const delay = this.getRandomInt(this.config.minDelay, this.config.maxDelay);
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, delay);
      });
    }
    
    const basePrice = this.getRandomInt(1, 100000);
    const randomFactor = Math.random() * 10;
    const price = basePrice * randomFactor;
    
    return {
      tokenId: tokenDto.tokenId,
      price,
    };
  }

  constructor(
    @Inject(INJECT_TOKENS.MOCK_PRICE_SERVICE_CONFIG) 
    private readonly config: MockPriceServiceConfig
  ) {}

  async getRandomPriceForToken(token: Token | TokenDto): Promise<number> {
    // Simulate API call delay only if enabled
    if (this.config.enableDelay) {
      const delay = this.getRandomInt(this.config.minDelay, this.config.maxDelay);
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, delay);
      });
    }
    
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
