import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from '../models/token.entity';
import { validateToken, TokenData } from '../models/token.schema';
import { getRandomAddress, getRandomUuid, getRandomString, getRandomInt, getRandomFloat } from '../utils/random';
import priceConfig, { PriceConfig } from '../config/price.config';

const CHAINS = [
  { name: 'Ethereum', id: getRandomUuid() },
  { name: 'Bitcoin', id: getRandomUuid() },
  { name: 'Solana', id: getRandomUuid() },
]

@Injectable()
export class TokenSeeder {
  private readonly logger = new Logger(TokenSeeder.name);

  constructor(
    @Inject(priceConfig.KEY)
    private config: PriceConfig,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
  ) {}

  async seed(createCount: number): Promise<void> {
    // Check if there are already tokens in the database
    const count = await this.tokenRepository.count();
    if (count > 0) {
      this.logger.log('Database already seeded, skipping...');
      return;
    }

    this.logger.log('Seeding initial data...');

    // Define token data and validate with Zod schema
    const tokenData = [...Array(createCount)].map(_ => this.getRandomToken())

    try {
      // Validate each token with Zod schema before saving
      const validatedTokens: TokenData[] = tokenData.map(data => validateToken(data));
      
      await this.tokenRepository.save(validatedTokens, {
        chunk: 1000,
        reload: false,
      });
      this.logger.log('Initial data seeded successfully');
    } catch (error: any) {
      this.logger.error('Failed to seed initial data', error?.stack);
      throw error;
    }
  }

  private getRandomToken (): TokenData {
    const name = getRandomString();
    const symbol = name.slice(0, 4).toUpperCase();
    const chain_DeId = getRandomInt(0, CHAINS.length - 1);
    const chain = CHAINS[chain_DeId];

    return {
      address: getRandomAddress(),
      symbol,
      name,
      decimals: getRandomInt(0, 18),
      isNative: false,
      chainId: chain.id,
      isProtected: true,
      lastUpdateAuthor: 'Seeder',
      priority: getRandomInt(1, 10),
      timestamp: new Date(),
      price: getRandomFloat(this.config.maxPrice),
      lastPriceUpdate: new Date(),
      
      chain_DeId,
      chain_Name: chain.name,
      chain_IsEnabled: true,
      
      logo_Id: getRandomUuid(),
      logo_TokenId: getRandomUuid(),
      logo_BigRelativePath: `/images/${symbol}_big.png`,
      logo_SmallRelativePath: `/images/${symbol}_small.png`,
      logo_ThumbRelativePath: `/images/${symbol}_thumb.png`,
    }
  } 
}
