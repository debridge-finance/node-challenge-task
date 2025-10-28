import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('tokens')
export class Token {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'bytea' })
  address!: Buffer;

  @Column({ type: 'varchar', nullable: true })
  symbol!: string | null;

  @Column({ type: 'varchar', nullable: true })
  name!: string | null;

  @Column({ type: 'smallint', default: 0 })
  decimals!: number;

  @Column({ default: false, name: 'is_native' })
  isNative!: boolean;

  @Column({ type: 'uuid', name: 'chain_id' })
  chainId!: string;

  @Column({ default: false, name: 'is_protected' })
  isProtected!: boolean;

  @Column({ type: 'varchar', nullable: true, name: 'last_update_author' })
  lastUpdateAuthor!: string | null;

  @Column({ default: 0 })
  priority!: number;

  @Column({ type: 'timestamptz', default: () => 'NOW()', name: 'created_at' })
  createdAt!: Date;

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  @OneToOne(() => Price, async (price) => price.token)
  lastPrice!: Promise<Price | null>;

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  @OneToOne(() => Logo, async (logo) => logo.token)
  logo!: Promise<Logo>;

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  @ManyToOne(() => Chain, async (c) => c.tokens)
  @JoinColumn({ name: 'chain_id', referencedColumnName: 'id' })
  chain!: Promise<Chain | null>;
}

@Entity('prices')
export class Price {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'token_id', unique: true })
  tokenId!: string;

  @Column({ type: 'decimal', precision: 28, scale: 0, default: 0 })
  price!: string;

  @Column({ type: 'timestamptz', default: () => 'NOW()', name: 'created_at' })
  createdAt!: Date;

  @Column({ type: 'timestamptz', default: () => 'NOW()', name: 'updated_at' })
  updatedAt!: Date;

  @OneToOne(() => Token)
  @JoinColumn({ name: 'token_id', referencedColumnName: 'id' })
  token!: Promise<Token | null>;
}

@Entity('chains')
export class Chain {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'de_id', type: 'decimal' })
  deId!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ name: 'is_enabled', default: true })
  isEnabled!: boolean;

  @OneToMany(() => Token, async (t) => t.chain)
  tokens!: Promise<Token[]>;
}

@Entity('logos')
export class Logo {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'token_id', unique: true })
  tokenId!: string;

  @Column({ name: 'big_relative_path', type: 'varchar' })
  bigRelativePath!: string;

  @Column({ name: 'small_relative_path', type: 'varchar' })
  smallRelativePath!: string;

  @Column({ name: 'thumb_relative_path', type: 'varchar' })
  thumbRelativePath!: string;

  @OneToOne(() => Token)
  @JoinColumn({ name: 'token_id', referencedColumnName: 'id' })
  token!: Promise<Token | null>;
}

