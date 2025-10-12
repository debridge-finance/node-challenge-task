import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column({ name: 'chain_name' })
  chainName: string;

  @Column({ name: 'chain_is_enabled', default: true })
  chainIsEnabled: boolean;

  // Denormalized logo data
  @Column({ name: 'logo_id', type: 'uuid' })
  logoId: string;

  @Column({ name: 'logo_token_id', type: 'uuid', nullable: true })
  logoTokenId: string | null;

  @Column({ name: 'logo_big_relative_path' })
  logoBigRelativePath: string;

  @Column({ name: 'logo_small_relative_path' })
  logoSmallRelativePath: string;

  @Column({ name: 'logo_thumb_relative_path' })
  logoThumbRelativePath: string;

  @Column({ type: 'decimal', precision: 28, scale: 0, default: 0 })
  price: number;

  @Column({ name: 'last_price_update', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastPriceUpdate: Date;
}
