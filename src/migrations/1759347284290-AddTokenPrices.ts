import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTokenPrices1759347284290 implements MigrationInterface {
  name = "AddTokenPrices1759347284290";
  public async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await q.query(`
      CREATE TABLE token_prices (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tokenId" uuid NOT NULL REFERENCES tokens(id) ON DELETE CASCADE,
        price numeric(28,0) NOT NULL,
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `);
    await q.query(`CREATE INDEX idx_token_prices_token ON token_prices("tokenId")`);
    await q.query(`CREATE INDEX idx_token_prices_updated ON token_prices(updated_at)`);
  }
  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE token_prices`);
  }
}
