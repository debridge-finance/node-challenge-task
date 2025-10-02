import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import {ChainEntity} from "../../chains/entities";

@Entity()
export class TokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  chainId: string;

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

  @Column({ default: 0 })
  priority: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date; // alt name for the timestamp column. To comply with the same naming convention

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date; // new column

  @Column({ nullable: true })
  updatedBy: string; // alt name for the lastUpdateAuthor column. To comply with the same naming convention

  @ManyToOne(() => ChainEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "chain_id", foreignKeyConstraintName: "token_to_chain_fk" })
  chain: ChainEntity
}