import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNormalizedSchema1759432869842 implements MigrationInterface {
  name = "CreateNormalizedSchema1759432869842";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE logos (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "bigRelativePath" varchar(255) NOT NULL,
        "smallRelativePath" varchar(255) NOT NULL,
        "thumbRelativePath" varchar(255) NOT NULL,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE price_feeds (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        name varchar(100) NOT NULL,
        description varchar(500),
        "apiUrl" varchar(255),
        "apiKey" varchar(50),
        "isActive" boolean NOT NULL DEFAULT true,
        priority integer NOT NULL DEFAULT 0,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      ALTER TABLE tokens 
      ADD COLUMN "logoId" uuid REFERENCES logos(id),
      ADD COLUMN "priceFeedId" uuid REFERENCES price_feeds(id),
      ADD COLUMN "symbolIndex" varchar(10),
      ADD COLUMN "isActive" boolean NOT NULL DEFAULT true
    `);

    await queryRunner.query(`CREATE INDEX idx_tokens_logo_id ON tokens("logoId")`);
    await queryRunner.query(`CREATE INDEX idx_tokens_price_feed_id ON tokens("priceFeedId")`);
    await queryRunner.query(`CREATE INDEX idx_tokens_symbol_index ON tokens("symbolIndex")`);
    await queryRunner.query(`CREATE INDEX idx_tokens_is_active ON tokens("isActive")`);
    await queryRunner.query(
      `CREATE INDEX idx_tokens_priority_active ON tokens(priority, "isActive")`
    );

    await queryRunner.query(`CREATE INDEX idx_price_feeds_is_active ON price_feeds("isActive")`);
    await queryRunner.query(`CREATE INDEX idx_price_feeds_priority ON price_feeds(priority)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_price_feeds_priority`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_price_feeds_is_active`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_tokens_priority_active`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_tokens_is_active`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_tokens_symbol_index`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_tokens_price_feed_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_tokens_logo_id`);

    await queryRunner.query(`
      ALTER TABLE tokens 
      DROP COLUMN IF EXISTS "logoId",
      DROP COLUMN IF EXISTS "priceFeedId",
      DROP COLUMN IF EXISTS "symbolIndex",
      DROP COLUMN IF EXISTS "isActive"
    `);

    await queryRunner.query(`DROP TABLE IF EXISTS price_feeds`);
    await queryRunner.query(`DROP TABLE IF EXISTS logos`);
  }
}
