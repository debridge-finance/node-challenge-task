import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from "typeorm";
import { Token } from "./token.entity";

@Entity("token_prices")
export class TokenPrice {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Token, { nullable: false })
  token: Token;

  @Index()
  @Column({ type: "numeric", precision: 28, scale: 0 })
  price: string;

  @Index()
  @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  updated_at: Date;
}
