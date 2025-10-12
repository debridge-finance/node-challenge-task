import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from '../models/token.entity';
import { validateToken } from '../models/token.schema';

@Injectable()
export class TokenSeeder {
  private readonly logger = new Logger(TokenSeeder.name);

  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
  ) {}

  async seed(): Promise<void> {
    // Check if there are already tokens in the database
    const count = await this.tokenRepository.count();
    if (count > 0) {
      this.logger.log('Database already seeded, skipping...');
      return;
    }

    this.logger.log('Seeding initial data...');

    const tokenData = [
      {
        address: Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09]),
        symbol: 'ETH',
        name: 'Ethereum',
        decimals: 18,
        isNative: true,
        isProtected: true,
        lastUpdateAuthor: 'Seeder',
        priority: 1,
        timestamp: new Date(),

        chainId: '11111111-1111-1111-1111-111111111111',
        chainName: 'Ethereum',
        chainIsEnabled: true,
        logoId: this.generateUuid(),
        logoTokenId: this.generateUuid(),
        logoBigRelativePath: '/images/eth_big.png',
        logoSmallRelativePath: '/images/eth_small.png',
        logoThumbRelativePath: '/images/eth_thumb.png',
        price: 300000,
        lastPriceUpdate: new Date(),
      },
      {
        address: Buffer.from([0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19]),
        symbol: 'BTC',
        name: 'Bitcoin',
        decimals: 8,
        isNative: true,
        isProtected: true,
        lastUpdateAuthor: 'Seeder',
        priority: 2,
        timestamp: new Date(),

        chainId: '22222222-2222-2222-2222-222222222222',
        chainName: 'Bitcoin',
        chainIsEnabled: true,

        logoId: this.generateUuid(),
        logoTokenId: this.generateUuid(),
        logoBigRelativePath: '/images/btc_big.png',
        logoSmallRelativePath: '/images/btc_small.png',
        logoThumbRelativePath: '/images/btc_thumb.png',

        price: 4500000,
        lastPriceUpdate: new Date(),
      },
      {
        address: Buffer.from([0x20, 0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29]),
        symbol: 'SOL',
        name: 'Solana',
        decimals: 9,
        isNative: true,
        isProtected: true,
        lastUpdateAuthor: 'Seeder',
        priority: 3,
        timestamp: new Date(),

        chainId: '33333333-3333-3333-3333-333333333333',
        chainName: 'Solana',
        chainIsEnabled: true,

        logoId: this.generateUuid(),
        logoTokenId: this.generateUuid(),
        logoBigRelativePath: '/images/sol_big.png',
        logoSmallRelativePath: '/images/sol_small.png',
        logoThumbRelativePath: '/images/sol_thumb.png',

        price: 15000,
        lastPriceUpdate: new Date(),
      },
    ];

    try {
      const validatedTokens = tokenData.map((data) => validateToken(data));

      await this.tokenRepository.save(validatedTokens);
      this.logger.log('Initial data seeded successfully');
    } catch (error) {
      this.logger.error('Failed to seed initial data', error.stack);
      throw error;
    }
  }

  private generateUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
