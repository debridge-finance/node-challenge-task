import {Column, Entity,  PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class ChainEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("bigint", {unique: true})
  deId: string // decimal overkill

  @Column("varchar")
  name: string

  @Column("boolean")
  isEnabled: boolean
}