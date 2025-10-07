import { MigrationInterface, QueryRunner } from "typeorm";

export class RemovePriceFromTokens1759431252298 implements MigrationInterface {
  name = "RemovePriceFromTokens1759431252298";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE tokens DROP COLUMN IF EXISTS price`);
    await queryRunner.query(`ALTER TABLE tokens DROP COLUMN IF EXISTS lastPriceUpdate`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE tokens ADD COLUMN price numeric(28,0) DEFAULT 0`);
    await queryRunner.query(
      `ALTER TABLE tokens ADD COLUMN lastPriceUpdate timestamp DEFAULT CURRENT_TIMESTAMP`
    );
  }
}
