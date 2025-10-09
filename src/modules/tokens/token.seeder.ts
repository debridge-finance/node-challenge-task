import { Injectable, Logger } from '@nestjs/common';
import {InjectEntityManager, InjectRepository} from '@nestjs/typeorm';
import {EntityManager, Repository} from 'typeorm';
import {Token} from "./token.entity";
import {validateToken} from "./schema/token.schema";
import {Chain} from "../chains/chain.entity";
import {Logo} from "../logos/logo.entity";

@Injectable()
export class TokenSeeder {
  private readonly logger = new Logger(TokenSeeder.name);

  constructor(
      @InjectEntityManager()
      private readonly manager: EntityManager,
  ) {}

  async seed(): Promise<void> {
      await this.manager.transaction(async (em) => {
          const tokenRepository = em.getRepository(Token);
          const chainRepository = em.getRepository(Chain);
          const logoRepository = em.getRepository(Logo);
          // Check if there are already tokens in the database
          const count = await tokenRepository.count();
          if (count > 0) {
              this.logger.log('Database already seeded, skipping...');
              return;
          }

          this.logger.log('Seeding initial data...');

          // Create at first chains data
          const chainsData = [
              { name: 'Ethereum', deId: 1, isEnabled: true },
              { name: 'Bitcoin', deId: 2, isEnabled: true },
              { name: 'Solana', deId: 3, isEnabled: true },
          ];

          const chains = await chainRepository.save(chainsData);

          // Insert to logos table
          const logosData = [
              {
                  bigRelativePath: '/images/eth_big.png',
                  smallRelativePath: '/images/eth_small.png',
                  thumbRelativePath: '/images/eth_thumb.png',
              },
              {
                  bigRelativePath: '/images/btc_big.png',
                  smallRelativePath: '/images/btc_small.png',
                  thumbRelativePath: '/images/btc_thumb.png',
              },
              {
                  bigRelativePath: '/images/sol_big.png',
                  smallRelativePath: '/images/sol_small.png',
                  thumbRelativePath: '/images/sol_thumb.png',
              },
          ];

          const logos = await logoRepository.save(logosData);

          // Create token data with chain and logos relations
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
                  chain_id: chains[0].id,
                  logo_id: logos[0].id,
                  price: 300000,
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
                  chain_id: chains[1].id,
                  logo_id: logos[1].id,
                  price: 4500000,
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
                  chain_id: chains[2].id,
                  logo_id: logos[2].id,
                  price: 15000,
              },
          ];

          try {
              // Validate each token with Zod schema before saving
              const validatedTokens = tokenData.map(data => validateToken(data));

              await tokenRepository.save(validatedTokens);
              this.logger.log('Initial data seeded successfully');
          } catch (error) {
              this.logger.error('Failed to seed initial data', error.stack);
              throw error;
          }
      });
  }

  private generateUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
