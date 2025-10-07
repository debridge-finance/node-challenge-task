import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm";

@Entity("outbox_events")
export class OutboxEvent {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index()
  @Column({ type: "varchar" })
  topic: string;

  @Column({ type: "jsonb" })
  payload: Record<string, unknown>;

  @Index()
  @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @Index()
  @Column({ type: "boolean", default: false })
  sent: boolean;

  @Index()
  @Column({ type: "boolean", default: false })
  processing: boolean;

  @Column({ type: "timestamptz", nullable: true })
  claimed_at: Date | null;

  @Column({ type: "timestamptz", nullable: true })
  sent_at: Date | null;
}
