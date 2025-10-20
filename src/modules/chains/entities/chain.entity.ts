import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { AbstractBase } from "../../../common/entities/abstract-base.entity";
import { Token } from "../../tokens/entities/token.entity";
import { ChainSlugs } from "../libs/constants/chain-slugs.const";
import { ItemLogo } from "../../item-logo/entities/item-logo.entity";

@Entity()
export class Chain extends AbstractBase {
  @Column({
    nullable: true,
  })
  blockchain_id: number;

  @Column()
  name: string;

  @Column()
  slug: ChainSlugs;

  @Column({ default: true })
  is_enabled: boolean;

  @ManyToOne(() => ItemLogo, (t) => t.chains, {
    nullable: true,
    onDelete: "CASCADE",
    orphanedRowAction: "delete",
  })
  @JoinColumn({ name: "logo_id" })
  logo: ItemLogo;

  @OneToMany(() => Token, (t) => t.chain)
  coins: Token[];
}
