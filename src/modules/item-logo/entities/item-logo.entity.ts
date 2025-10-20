import { Column, Entity, OneToMany, Index } from "typeorm";
import { Token } from "../../tokens/entities/token.entity";
import { AbstractBase } from "../../../common/entities/abstract-base.entity";
import { Chain } from "../../chains/entities/chain.entity";

@Entity()
export class ItemLogo extends AbstractBase {
  @Column({ unique: true })
  @Index()
  big_relative_path: string;

  @Column()
  small_relative_path: string;

  @Column()
  thumb_relative_path: string;

  @OneToMany(() => Token, (t) => t.logo)
  tokens: Token[];

  @OneToMany(() => Chain, (t) => t.logo)
  chains: Chain[];
}
