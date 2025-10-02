import {Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn} from "typeorm";
import {TokenEntity} from "../../tokens/entities";

@Entity("token-prices")
export class TokenPriceEntity {
  @PrimaryColumn("uuid")
  tokenId: string

  @Column({ type: 'decimal', precision: 28, scale: 0, default: 0 })
  price: number;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date; // alt name for the lastPriceUpdate column. To comply with the same naming convention

  @ManyToOne(() => TokenEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "tokenId", foreignKeyConstraintName: "token_price_to_token_fk" })
  token: TokenEntity;
}
