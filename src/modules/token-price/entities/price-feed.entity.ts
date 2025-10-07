import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { PriceFeedType, PriceFeedStatus } from "../../../shared/enums";

/**
 * Сущность источника цен
 * Нормализация данных для хранения информации об источниках цен
 */
@Entity("price_feeds")
export class PriceFeed {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: "enum",
    enum: PriceFeedType,
    default: PriceFeedType.COINGECKO,
  })
  type: PriceFeedType;

  @Column({
    type: "enum",
    enum: PriceFeedStatus,
    default: PriceFeedStatus.ACTIVE,
  })
  status: PriceFeedStatus;

  @Column({ type: "int", default: 1 })
  priority: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
