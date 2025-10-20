import { Column, Entity, Index, OneToMany } from "typeorm";
import { AbstractBase } from "../../../common/entities/abstract-base.entity";
import { Token } from "../../tokens/entities/token.entity";

@Entity()
@Index(["name", "symbol"], { unique: true })
export class TokenMetadata extends AbstractBase {
  @Column()
  symbol: string;

  @Column()
  name: string;

  @OneToMany(() => Token, (t) => t.token_metadata)
  tokens: Token[];
}
