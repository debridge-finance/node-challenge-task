import { MigrationInterface, QueryRunner } from 'typeorm';

export class Normalization1760215591186 implements MigrationInterface {
  name = 'Normalization1760215591186';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "chains" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "is_enabled" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "UQ_chains_name" UNIQUE ("name"),
        CONSTRAINT "PK_chains" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "logos" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "token_id" uuid,
        "big_relative_path" character varying NOT NULL,
        "small_relative_path" character varying NOT NULL,
        "thumb_relative_path" character varying NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_logos" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      INSERT INTO "chains" ("id", "name", "is_enabled")
      SELECT DISTINCT "chain_id", "chain_name", "chain_is_enabled"
      FROM "tokens"
    `);

    await queryRunner.query(`
      INSERT INTO "logos" ("id", "token_id", "big_relative_path", "small_relative_path", "thumb_relative_path")
      SELECT DISTINCT "logo_id", "logo_token_id", "logo_big_relative_path", "logo_small_relative_path", "logo_thumb_relative_path"
      FROM "tokens"
    `);

    await queryRunner.query(`
      ALTER TABLE "tokens"
      ADD CONSTRAINT "FK_tokens_chains"
      FOREIGN KEY ("chain_id")
      REFERENCES "chains"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "tokens"
      ADD CONSTRAINT "FK_tokens_logos"
      FOREIGN KEY ("logo_id")
      REFERENCES "logos"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "tokens"
      DROP COLUMN "chain_name",
      DROP COLUMN "chain_is_enabled",
      DROP COLUMN "logo_token_id",
      DROP COLUMN "logo_big_relative_path",
      DROP COLUMN "logo_small_relative_path",
      DROP COLUMN "logo_thumb_relative_path"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "tokens"
      ADD COLUMN "chain_name" character varying,
      ADD COLUMN "chain_is_enabled" boolean DEFAULT true,
      ADD COLUMN "logo_token_id" uuid,
      ADD COLUMN "logo_big_relative_path" character varying,
      ADD COLUMN "logo_small_relative_path" character varying,
      ADD COLUMN "logo_thumb_relative_path" character varying
    `);

    await queryRunner.query(`
      UPDATE "tokens" t
      SET 
        "chain_name" = c."name",
        "chain_is_enabled" = c."is_enabled"
      FROM "chains" c
      WHERE t."chain_id" = c."id"
    `);

    await queryRunner.query(`
      UPDATE "tokens" t
      SET 
        "logo_token_id" = l."token_id",
        "logo_big_relative_path" = l."big_relative_path",
        "logo_small_relative_path" = l."small_relative_path",
        "logo_thumb_relative_path" = l."thumb_relative_path"
      FROM "logos" l
      WHERE t."logo_id" = l."id"
    `);

    await queryRunner.query(`
      ALTER TABLE "tokens"
      DROP CONSTRAINT "FK_tokens_chains"
    `);

    await queryRunner.query(`
      ALTER TABLE "tokens"
      DROP CONSTRAINT "FK_tokens_logos"
    `);

    await queryRunner.query(`DROP TABLE "logos"`);
    await queryRunner.query(`DROP TABLE "chains"`);
  }
}
