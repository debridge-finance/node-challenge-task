import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOutboxProcessing1759443365901 implements MigrationInterface {
  name = "AddOutboxProcessing1759443365901";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE outbox_events ADD COLUMN IF NOT EXISTS processing boolean NOT NULL DEFAULT false`
    );
    await queryRunner.query(
      `ALTER TABLE outbox_events ADD COLUMN IF NOT EXISTS claimed_at timestamptz NULL`
    );
    await queryRunner.query(
      `ALTER TABLE outbox_events ADD COLUMN IF NOT EXISTS sent_at timestamptz NULL`
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_outbox_processing ON outbox_events(processing)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_outbox_processing`);
    await queryRunner.query(`ALTER TABLE outbox_events DROP COLUMN IF EXISTS sent_at`);
    await queryRunner.query(`ALTER TABLE outbox_events DROP COLUMN IF EXISTS claimed_at`);
    await queryRunner.query(`ALTER TABLE outbox_events DROP COLUMN IF EXISTS processing`);
  }
}
