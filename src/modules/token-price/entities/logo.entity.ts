import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Token } from "./token.entity";

@Entity("logos")
export class Logo {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 255 })
  bigRelativePath: string;

  @Column({ type: "varchar", length: 255 })
  smallRelativePath: string;

  @Column({ type: "varchar", length: 255 })
  thumbRelativePath: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  updatedAt: Date;

  @OneToMany(() => Token, (token) => token.logo)
  tokens: Token[];
}
