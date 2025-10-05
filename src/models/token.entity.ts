import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { Chain } from './chain.entity';
import { Logo } from './logo.entity';

@Entity('tokens')
export class Token {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  address: string;

  @Column({ nullable: true })
  symbol: string;

  @Column({ nullable: true })
  name: string;

  @Column({ type: 'smallint', default: 0 })
  decimals: number;

  @Column({ default: false })
  isNative: boolean;

  @Column({ type: 'uuid' })
  chainId: string;

  @ManyToOne(() => Chain, chain => chain.tokens)
  @JoinColumn({ name: 'chainId' })
  chain: Chain;

  @OneToOne(() => Logo, logo => logo.token)
  logo: Logo;

  @Column({ default: false })
  isProtected: boolean;

  @Column({ nullable: true })
  lastUpdateAuthor: string;

  @Column({ default: 0 })
  priority: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;


  @Column({ type: 'decimal', precision: 18, scale: 8, default: 0 })
  price: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastPriceUpdate: Date;
}
