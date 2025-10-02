import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity("token-logos")
export class TokenLogoEntity {
  @PrimaryGeneratedColumn('uuid' )
  id: string;

  @Column({ type: 'uuid', nullable: true })
  tokenId: string;

  @Column("varchar")
  bigRelativePath: string;

  @Column("varchar")
  smallRelativePath: string;

  @Column("varchar")
  thumbRelativePath: string;
}