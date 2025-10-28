import { MigrationInterface, QueryRunner } from 'typeorm';

export class NormalizePrices1761592045949 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
       CREATE TABLE "prices" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "token_id" uuid UNIQUE NOT NULL,
          "price" numeric(28, 0) NOT NULL,
          "updated_at" timestamptz NOT NULL DEFAULT NOW(),
          "created_at" timestamptz NOT NULL DEFAULT NOW(),
          CONSTRAINT "PK_prices" PRIMARY KEY ("id")
       )
    `);

    await queryRunner.query(`
      INSERT INTO "prices" (id, token_id, price, updated_at, created_at)
      SELECT DISTINCT ON (id)
        tokens.id,
        tokens.id,
        tokens.price,
        tokens."lastPriceUpdate",
        tokens."lastPriceUpdate"
      FROM "tokens"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "prices"');
  }
}
