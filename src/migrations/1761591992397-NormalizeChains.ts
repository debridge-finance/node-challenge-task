import { MigrationInterface, QueryRunner } from 'typeorm';

export class NormalizeChains1761591992397 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
       CREATE TABLE "chains" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "de_id" numeric NOT NULL,
          "name" varchar NOT NULL,
          "is_enabled" boolean NOT NULL DEFAULT true,
          CONSTRAINT "PK_chains" PRIMARY KEY ("id")
       )
    `);

    await queryRunner.query(`
      INSERT INTO "chains" (id, de_id, name, is_enabled)
      SELECT DISTINCT ON (chain_id)
        chain_id,
        chain_deid,
        chain_name,
        chain_isenabled
      FROM "tokens"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "chains"');
  }
}
