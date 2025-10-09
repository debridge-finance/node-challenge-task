import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Token} from "../tokens/token.entity";

@Entity('chains')
export class Chain {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'decimal' })
    deId: number;

    @Column()
    name: string;

    @Column({ default: true })
    isEnabled: boolean;

    @OneToMany(() => Token, token => token.chain)
    tokens: Token[];
}
