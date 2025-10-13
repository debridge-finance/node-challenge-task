import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFeedTable1684654321001 implements MigrationInterface {
  name = 'CreateFeedTable1684654321001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "feed_status_enum" AS ENUM ('pending', 'processing', 'processed', 'failed');

      CREATE TABLE "feed" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "token_id" uuid NOT NULL,
        "status" "feed_status_enum" NOT NULL DEFAULT 'pending',
        "error" character varying,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_feed" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "feed"`);
    await queryRunner.query(`DROP TYPE "feed_status_enum"`);
  }
}
