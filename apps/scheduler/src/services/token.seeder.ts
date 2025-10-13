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

  private factory = (
    address: number[],
    symbol: string,
    name: string,
    decimals: number,
    chainId: string,
    chainName: string,
    priority: number,
    price: number,
    logoPrefix: string,
  ) => ({
    address: Buffer.from(address),
    symbol,
    name,
    decimals,
    isNative: true,
    isProtected: true,
    lastUpdateAuthor: 'Seeder',
    priority,
    timestamp: new Date(),
    chainId,
    chainName,
    chainIsEnabled: true,
    logoId: this.generateUuid(),
    logoTokenId: this.generateUuid(),
    logoBigRelativePath: `/images/${logoPrefix}_big.png`,
    logoSmallRelativePath: `/images/${logoPrefix}_small.png`,
    logoThumbRelativePath: `/images/${logoPrefix}_thumb.png`,
    price,
    lastPriceUpdate: new Date(),
  });

  async seed(): Promise<void> {
    const count = await this.tokenRepository.count();
    if (count > 0) {
      this.logger.log('Database already seeded, skipping...');
      return;
    }

    this.logger.log('Seeding initial data...');

    const tokenData = [
      this.factory(
        [0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09],
        'ETH',
        'Ethereum',
        18,
        '11111111-1111-1111-1111-111111111111',
        'Ethereum',
        1,
        300000,
        'eth',
      ),
      this.factory(
        [0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19],
        'BTC',
        'Bitcoin',
        8,
        '22222222-2222-2222-2222-222222222222',
        'Bitcoin',
        2,
        4500000,
        'btc',
      ),
      this.factory(
        [0x20, 0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29],
        'SOL',
        'Solana',
        9,
        '33333333-3333-3333-3333-333333333333',
        'Solana',
        3,
        15000,
        'sol',
      ),
      this.factory(
        [0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39],
        'BNB',
        'Binance Coin',
        18,
        '44444444-4444-4444-4444-444444444444',
        'Binance Smart Chain',
        4,
        32000,
        'bnb',
      ),
      this.factory(
        [0x40, 0x41, 0x42, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49],
        'ADA',
        'Cardano',
        6,
        '55555555-5555-5555-5555-555555555555',
        'Cardano',
        5,
        500,
        'ada',
      ),
      this.factory(
        [0x50, 0x51, 0x52, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59],
        'DOT',
        'Polkadot',
        10,
        '66666666-6666-6666-6666-666666666666',
        'Polkadot',
        6,
        700,
        'dot',
      ),
      this.factory(
        [0x60, 0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69],
        'AVAX',
        'Avalanche',
        18,
        '77777777-7777-7777-7777-777777777777',
        'Avalanche',
        7,
        950,
        'avax',
      ),
      this.factory(
        [0x70, 0x71, 0x72, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79],
        'MATIC',
        'Polygon',
        18,
        '88888888-8888-8888-8888-888888888888',
        'Polygon',
        8,
        120,
        'matic',
      ),
      this.factory(
        [0x80, 0x81, 0x82, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89],
        'TRX',
        'Tron',
        6,
        '99999999-9999-9999-9999-999999999999',
        'Tron',
        9,
        90,
        'trx',
      ),
      this.factory(
        [0x90, 0x91, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99],
        'XRP',
        'Ripple',
        6,
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'Ripple',
        10,
        500,
        'xrp',
      ),
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
