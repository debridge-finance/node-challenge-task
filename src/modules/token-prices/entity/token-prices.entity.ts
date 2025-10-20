import { Column, Entity, OneToMany } from "typeorm";
import { AbstractBase } from "../../../common/entities/abstract-base.entity";
import { Token } from "../../tokens/entities/token.entity";
import { TokensSources } from "../../tokens/libs/constants/token-sources.const";

@Entity()
export class TokenPrices extends AbstractBase {
  @Column({
    type: "decimal",
    precision: 28,
    scale: 18,
    default: "0",
  })
  usd_price: string;

  @Column()
  last_updated_price_at: Date;

  @Column()
  last_updated_price_by_source: TokensSources;

  @OneToMany(() => Token, (t) => t.token_price)
  tokens: Token[];
}
