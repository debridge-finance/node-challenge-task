import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { AbstractBase } from "../../../common/entities/abstract-base.entity";
import { Chain } from "../../chains/entities/chain.entity";
import { TokenMetadata } from "../../tokens-metadata/entities/token-metadata.entity";
import { ItemLogo } from "../../item-logo/entities/item-logo.entity";
import { TokenPrices } from "../../token-prices/entity/token-prices.entity";

@Entity()
@Index(["address", "chain"], { unique: true })
export class Token extends AbstractBase {
  @Column({
    transformer: {
      to: (value: string) => value.toLowerCase(),
      from: (value: string) => value.toLowerCase(),
    },
  })
  address: string;

  @Column({ type: "smallint" })
  decimals: number;

  @Column({ default: false })
  is_native: boolean;

  @Column({ default: false })
  is_protected: boolean;

  @Column({ default: 0 })
  priority: number;

  @ManyToOne(() => TokenPrices, (t) => t.tokens, {
    nullable: true,
  })
  @JoinColumn({ name: "token_price_id" })
  token_price: TokenPrices;

  @ManyToOne(() => TokenMetadata, (t) => t.tokens, {
    nullable: false,
    onDelete: "CASCADE",
    orphanedRowAction: "delete",
  })
  @JoinColumn({ name: "token_metadata_id" })
  token_metadata: TokenMetadata;

  @ManyToOne(() => ItemLogo, (t) => t.tokens, {
    nullable: false,
    onDelete: "CASCADE",
    orphanedRowAction: "delete",
  })
  @JoinColumn({ name: "logo_id" })
  logo: ItemLogo;

  @ManyToOne(() => Chain, (chain) => chain, {
    nullable: false,
  })
  @JoinColumn({ name: "chain_id" })
  chain: Chain;
}
