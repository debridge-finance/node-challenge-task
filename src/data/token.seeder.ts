import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from '../models/token.entity';
import { Chain } from '../models/chain.entity';
import { Logo } from '../models/logo.entity';

@Injectable()
export class TokenSeeder {
  private readonly logger = new Logger(TokenSeeder.name);

  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    @InjectRepository(Chain)
    private readonly chainRepository: Repository<Chain>,
    @InjectRepository(Logo)
    private readonly logoRepository: Repository<Logo>,
  ) {}

  async seed(): Promise<void> {
    // Check if there are already tokens in the database
    const count = await this.tokenRepository.count();
    if (count > 0) {
      this.logger.log('Database already seeded, skipping...');
      return;
    }

    this.logger.log('Seeding initial data...');

    // Create chains first
    const ethereumChain = await this.chainRepository.save({
      id: '11111111-1111-1111-1111-111111111111',
      debridgeId: 1,
      name: 'Ethereum',
      isEnabled: true,
    });

    const bitcoinChain = await this.chainRepository.save({
      id: '22222222-2222-2222-2222-222222222222',
      debridgeId: 2,
      name: 'Bitcoin',
      isEnabled: true,
    });

    const solanaChain = await this.chainRepository.save({
      id: '33333333-3333-3333-3333-333333333333',
      debridgeId: 3,
      name: 'Solana',
      isEnabled: true,
    });

    // Define token data and validate with Zod schema
    const tokenData = [
      {
        address: '0x0000000000000000000000000000000000000000',
        symbol: 'ETH',
        name: 'Ethereum',
        decimals: 18,
        isNative: true,
        chainId: '11111111-1111-1111-1111-111111111111',
        isProtected: true,
        lastUpdateAuthor: 'Seeder',
        priority: 1,
        timestamp: new Date(),
        
        
        price: 3000.00,
        lastPriceUpdate: new Date(),
      },
      {
        address: '0x1111111111111111111111111111111111111111',
        symbol: 'BTC',
        name: 'Bitcoin',
        decimals: 8,
        isNative: true,
        chainId: '22222222-2222-2222-2222-222222222222',
        isProtected: true,
        lastUpdateAuthor: 'Seeder',
        priority: 2,
        timestamp: new Date(),
        
        
        price: 45000.00,
        lastPriceUpdate: new Date(),
      },
      {
        address: '0x2222222222222222222222222222222222222222',
        symbol: 'SOL',
        name: 'Solana',
        decimals: 9,
        isNative: true,
        chainId: '33333333-3333-3333-3333-333333333333',
        isProtected: true,
        lastUpdateAuthor: 'Seeder',
        priority: 3,
        timestamp: new Date(),
        
        
        price: 150.00,
        lastPriceUpdate: new Date(),
      },
    ];

    try {
      // Save tokens
      for (let i = 0; i < tokenData.length; i++) {
        const data = tokenData[i];
        const token = await this.tokenRepository.save(data);
        
        // Create logo for each token
        const logoPath = data.symbol.toLowerCase();
        await this.logoRepository.save({
          tokenId: token.id,
          bigRelativePath: `/images/${logoPath}_big.png`,
          smallRelativePath: `/images/${logoPath}_small.png`,
          thumbRelativePath: `/images/${logoPath}_thumb.png`,
        });
      }
      
      this.logger.log('Initial data seeded successfully');
    } catch (error) {
      this.logger.error('Failed to seed initial data', error.stack);
      throw error;
    }
  }

}
