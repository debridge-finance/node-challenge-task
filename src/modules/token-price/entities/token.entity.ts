import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index } from "typeorm";
import { Logo } from "./logo.entity";
import { PriceFeed } from "./price-feed.entity";
import { TokenType, TokenStatus } from "../../../shared/enums";

@Entity("tokens")
export class Token {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "bytea" })
  address: Buffer;

  @Column({ nullable: true })
  symbol: string;

  @Column({ nullable: true })
  name: string;

  @Column({ type: "smallint", default: 0 })
  decimals: number;

  @Column({
    type: "enum",
    enum: TokenType,
    default: TokenType.ERC20,
  })
  type: TokenType;

  @Column({ type: "uuid" })
  chainId: string;

  @Column({
    type: "enum",
    enum: TokenStatus,
    default: TokenStatus.ACTIVE,
  })
  status: TokenStatus;

  @Column({ nullable: true })
  lastUpdateAuthor: string;

  @Column({ default: 0 })
  priority: number;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  timestamp: Date;

  // Связь с логотипом (многие токены могут использовать один логотип)
  @ManyToOne(() => Logo, { nullable: true, eager: false })
  @JoinColumn({ name: "logoId" })
  logo: Logo;

  @Column({ type: "uuid", nullable: true })
  logoId: string;

  // Связь с price feed (многие токены могут использовать один price feed)
  @ManyToOne(() => PriceFeed, { nullable: true, eager: false })
  @JoinColumn({ name: "priceFeedId" })
  priceFeed: PriceFeed;

  @Column({ type: "uuid", nullable: true })
  priceFeedId: string;

  // Индексы для производительности
  @Index()
  @Column({ type: "varchar", length: 10, nullable: true })
  symbolIndex: string; // Для быстрого поиска по символу

  @Index()
  @Column({ type: "boolean", default: true })
  isActive: boolean;
}
