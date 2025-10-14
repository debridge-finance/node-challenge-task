import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Chain } from './chain.entity';
import { Logo } from './logo.entity';

@Entity('tokens')
export class Token {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'bytea' })
  address: Buffer;

  @Column({ type: 'varchar', nullable: true })
  symbol: string | null;

  @Column({ type: 'varchar', nullable: true })
  name: string | null;

  @Column({ type: 'smallint', default: 0 })
  decimals: number;

  @Column({ name: 'is_native', default: false })
  isNative: boolean;

  @Column({ name: 'is_protected', default: false })
  isProtected: boolean;

  @Column({ name: 'last_update_author', type: 'varchar', nullable: true })
  lastUpdateAuthor: string | null;

  @Column({ default: 0 })
  priority: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @Column({ name: 'chain_id', type: 'uuid' })
  chainId: string;

  @ManyToOne(() => Chain, (chain) => chain.tokens)
  @JoinColumn({ name: 'chain_id' })
  chain: Chain;

  @Column({ name: 'logo_id', type: 'uuid' })
  logoId: string;

  @ManyToOne(() => Logo, (logo) => logo.tokens)
  @JoinColumn({ name: 'logo_id' })
  logo: Logo;

  @Column({ type: 'decimal', precision: 28, scale: 0, default: 0 })
  price: number;

  @Column({ name: 'last_price_update', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastPriceUpdate: Date;
}
