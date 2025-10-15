import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum FeedStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  PROCESSED = 'processed',
  FAILED = 'failed',
}

@Entity('feed')
export class Feed {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'token_id', type: 'uuid' })
  tokenId: string;

  @Column({ type: 'varchar', nullable: true })
  symbol: string | null;

  @Column({ name: 'old_price', type: 'decimal', precision: 28, scale: 0, default: 0 })
  oldPrice: number;

  @Column({ name: 'new_price', type: 'decimal', precision: 28, scale: 0, default: 0 })
  newPrice: number;

  @Column({
    type: 'enum',
    enum: FeedStatus,
    default: FeedStatus.PENDING,
  })
  status: FeedStatus;

  @Column({ type: 'varchar', nullable: true })
  error: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
