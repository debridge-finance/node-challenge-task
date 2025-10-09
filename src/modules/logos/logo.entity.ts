import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Token} from "../tokens/token.entity";

@Entity('logos')
export class Logo {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', nullable: true })
    tokenId: string;

    @Column()
    bigRelativePath: string;

    @Column()
    smallRelativePath: string;

    @Column()
    thumbRelativePath: string;

    @OneToMany(() => Token, token => token.logo)
    tokens: Token[];
}
