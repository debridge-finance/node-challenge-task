import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { Token } from './token.entity';

@Entity('logos')
export class Logo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  tokenId: string;

  @Column()
  bigRelativePath: string;

  @Column()
  smallRelativePath: string;

  @Column()
  thumbRelativePath: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToOne(() => Token, token => token.logo)
  @JoinColumn({ name: 'tokenId' })
  token: Token;
}