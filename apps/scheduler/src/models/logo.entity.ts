import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Token } from './token.entity';

@Entity('logos')
export class Logo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'token_id', type: 'uuid', nullable: true })
  tokenId: string | null;

  @Column({ name: 'big_relative_path' })
  bigRelativePath: string;

  @Column({ name: 'small_relative_path' })
  smallRelativePath: string;

  @Column({ name: 'thumb_relative_path' })
  thumbRelativePath: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => Token, (token) => token.logo)
  tokens: Token[];
}
