import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Token } from './token.entity';

@Entity('chains')
export class Chain {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'bigint', unique: true })
  deid: number;

  @Column()
  name: string;

  @Column({ default: true })
  isEnabled: boolean;

  @OneToMany(() => Token, token => token.chain)
  tokens: Token[];
}


