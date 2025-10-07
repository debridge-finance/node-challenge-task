import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOutbox1759349444145 implements MigrationInterface {
  name = "AddOutbox1759349444145";
  public async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await q.query(`
      CREATE TABLE outbox_events(
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        topic varchar NOT NULL,
        payload jsonb NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        sent boolean NOT NULL DEFAULT false
      );
    `);
    await q.query(`CREATE INDEX idx_outbox_topic ON outbox_events(topic)`);
    await q.query(`CREATE INDEX idx_outbox_created ON outbox_events(created_at)`);
    await q.query(`CREATE INDEX idx_outbox_sent ON outbox_events(sent)`);
  }
  public async down(q: QueryRunner): Promise<void> {
    await q.query("DROP TABLE outbox_events");
  }
}
