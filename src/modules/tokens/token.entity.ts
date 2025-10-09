import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn} from 'typeorm';
import {Logo} from "../logos/logo.entity";
import {Chain} from "../chains/chain.entity";

@Entity('tokens')
export class Token {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'bytea' })
  address: Buffer;

  @Column({ nullable: true })
  symbol: string;

  @Column({ nullable: true })
  name: string;

  @Column({ type: 'smallint', default: 0 })
  decimals: number;

  @Column({ default: false })
  isNative: boolean;

  @Column({ default: false })
  isProtected: boolean;

  @Column({ nullable: true })
  lastUpdateAuthor: string;

  @Column({ default: 0 })
  priority: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @Column({ type: 'decimal', precision: 28, scale: 0, default: 0, transformer:{
    to: (value: number) => value,
    from: (value: string) => parseFloat(value)
      } })
  price: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastPriceUpdate: Date;

  @Column({ name: 'logo_id', type: 'uuid' })
  logo_id: string;

  @ManyToOne(() => Logo, logo => logo.tokens)
  @JoinColumn({ name: 'logo_id' })
  logo: Logo;

  @Column({ type: 'uuid' })
  chain_id: string;

  @ManyToOne(() => Chain, chain => chain.tokens)
  @JoinColumn({ name: 'chain_id' })
  chain: Chain;
}
