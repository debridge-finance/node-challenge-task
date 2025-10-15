import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from '../../models/token.entity';
import { Chain } from '../../models/chain.entity';
import { Logo } from '../../models/logo.entity';
import { validateToken } from '../../models/token.schema';
import { validateChain } from '../../models/chain.schema';
import { validateLogo } from '../../models/logo.schema';

@Injectable()
export class TokenSeederService implements OnModuleInit {
  private readonly logger = new Logger(TokenSeederService.name);

  async onModuleInit() {
    await this.seed();
  }

  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    @InjectRepository(Chain)
    private readonly chainRepository: Repository<Chain>,
    @InjectRepository(Logo)
    private readonly logoRepository: Repository<Logo>,
  ) {}

  private createChain = (id: string, name: string) => ({
    id,
    name,
    isEnabled: true,
  });

  private createLogo = (id: string, logoPrefix: string) => ({
    id,
    tokenId: null,
    bigRelativePath: `/images/${logoPrefix}_big.png`,
    smallRelativePath: `/images/${logoPrefix}_small.png`,
    thumbRelativePath: `/images/${logoPrefix}_thumb.png`,
  });

  private createToken = (
    address: number[],
    symbol: string,
    name: string,
    decimals: number,
    chainId: string,
    priority: number,
    price: number,
    logoId: string,
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
    logoId,
    price,
    lastPriceUpdate: new Date(),
  });

  async seed(): Promise<void> {
    const count = await this.tokenRepository.count();
    if (count > 0) {
      return this.logger.log('Database already seeded, skipping...');
    }

    this.logger.log('Seeding initial data...');

    const chainData = [
      this.createChain('11111111-1111-1111-1111-111111111111', 'Ethereum'),
      this.createChain('22222222-2222-2222-2222-222222222222', 'Bitcoin'),
      this.createChain('33333333-3333-3333-3333-333333333333', 'Solana'),
      this.createChain('44444444-4444-4444-4444-444444444444', 'Binance Smart Chain'),
      this.createChain('55555555-5555-5555-5555-555555555555', 'Cardano'),
      this.createChain('66666666-6666-6666-6666-666666666666', 'Polkadot'),
      this.createChain('77777777-7777-7777-7777-777777777777', 'Avalanche'),
      this.createChain('88888888-8888-8888-8888-888888888888', 'Polygon'),
      this.createChain('99999999-9999-9999-9999-999999999999', 'Tron'),
      this.createChain('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Ripple'),
    ];

    const validatedChains = chainData.map((data) => validateChain(data));
    await this.chainRepository.save(validatedChains);
    this.logger.log('Chain data seeded successfully');

    const logoIds = Array(10)
      .fill(0)
      .map(() => this.generateUuid());

    const logoPrefixes = ['eth', 'btc', 'sol', 'bnb', 'ada', 'dot', 'avax', 'matic', 'trx', 'xrp'];

    const logoData = logoIds.map((id, index) => this.createLogo(id, logoPrefixes[index]));

    const validatedLogos = logoData.map((data) => validateLogo(data));
    await this.logoRepository.save(validatedLogos);
    this.logger.log('Logo data seeded successfully');

    const tokenData = [
      this.createToken(
        [0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09],
        'ETH',
        'Ethereum',
        18,
        '11111111-1111-1111-1111-111111111111',
        1,
        300000,
        logoIds[0],
      ),
      this.createToken(
        [0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19],
        'BTC',
        'Bitcoin',
        8,
        '22222222-2222-2222-2222-222222222222',
        2,
        4500000,
        logoIds[1],
      ),
      this.createToken(
        [0x20, 0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29],
        'SOL',
        'Solana',
        9,
        '33333333-3333-3333-3333-333333333333',
        3,
        15000,
        logoIds[2],
      ),
      this.createToken(
        [0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39],
        'BNB',
        'Binance Coin',
        18,
        '44444444-4444-4444-4444-444444444444',
        4,
        32000,
        logoIds[3],
      ),
      this.createToken(
        [0x40, 0x41, 0x42, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49],
        'ADA',
        'Cardano',
        6,
        '55555555-5555-5555-5555-555555555555',
        5,
        500,
        logoIds[4],
      ),
      this.createToken(
        [0x50, 0x51, 0x52, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59],
        'DOT',
        'Polkadot',
        10,
        '66666666-6666-6666-6666-666666666666',
        6,
        700,
        logoIds[5],
      ),
      this.createToken(
        [0x60, 0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69],
        'AVAX',
        'Avalanche',
        18,
        '77777777-7777-7777-7777-777777777777',
        7,
        950,
        logoIds[6],
      ),
      this.createToken(
        [0x70, 0x71, 0x72, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79],
        'MATIC',
        'Polygon',
        18,
        '88888888-8888-8888-8888-888888888888',
        8,
        120,
        logoIds[7],
      ),
      this.createToken(
        [0x80, 0x81, 0x82, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89],
        'TRX',
        'Tron',
        6,
        '99999999-9999-9999-9999-999999999999',
        9,
        90,
        logoIds[8],
      ),
      this.createToken(
        [0x90, 0x91, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99],
        'XRP',
        'Ripple',
        6,
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        10,
        500,
        logoIds[9],
      ),
    ];

    const validatedTokens = tokenData.map((data) => validateToken(data));
    await this.tokenRepository.save(validatedTokens);
    this.logger.log('Token data seeded successfully');
  }

  private generateUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
