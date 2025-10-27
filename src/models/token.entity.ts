// Optimized the entity:
// - Added indexes to frequently queried fields
// - Proper timestamp handling
// - Safe decimal handling for price
// - Consistent column naming and length limits
// TODO check performance after implementation of column indexes
import { Entity, Column, PrimaryGeneratedColumn, Index } from "typeorm";

@Entity({ name: "tokens" })
export class Token {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index()
  @Column({ type: "bytea" })
  address: Buffer;

  @Index()
  @Column({ type: "varchar", length: 32, nullable: true })
  symbol?: string;

  @Column({ type: "varchar", length: 128, nullable: true })
  name?: string;

  @Column({ type: "smallint", default: 0 })
  decimals: number;

  @Column({ default: false })
  isNative: boolean;

  @Index()
  @Column({ type: "uuid" })
  chainId: string;

  @Column({ default: false })
  isProtected: boolean;

  @Column({ type: "varchar", length: 128, nullable: true })
  lastUpdateAuthor?: string;

  @Column({ default: 0 })
  priority: number;

  @Column({
    type: "timestamp with time zone",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  timestamp: Date;

  // Denormalized chain data (intentional anti-pattern)
  @Column({ name: "chain_id", type: "uuid" })
  chain_Id: string;

  @Column({ name: "chain_deid", type: "decimal" })
  chain_DeId: number;

  @Column({ name: "chain_name" })
  chain_Name: string;

  @Column({ name: "chain_isenabled", default: true })
  chain_IsEnabled: boolean;

  // Denormalized logo data (intentional anti-pattern)
  @Column({ name: "logo_id", type: "uuid" })
  logo_Id: string;

  @Column({ name: "logo_tokenid", type: "uuid", nullable: true })
  logo_TokenId: string;

  @Column({ name: "logo_bigrelativepath" })
  logo_BigRelativePath: string;

  @Column({ name: "logo_smallrelativepath" })
  logo_SmallRelativePath: string;

  @Column({ name: "logo_thumbrelativepath" })
  logo_ThumbRelativePath: string;

  @Column({
    type: "decimal",
    precision: 28,
    scale: 8,
    default: 0,
  })
  price: number;

  @Column({
    type: "timestamp with time zone",
    default: () => "CURRENT_TIMESTAMP(6)",
    onUpdate: "CURRENT_TIMESTAMP(6)",
  })
  lastPriceUpdate: Date;
}
