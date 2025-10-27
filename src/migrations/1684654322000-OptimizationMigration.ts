// Optimized the database structure
import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1684654322000 implements MigrationInterface {
  name = "OptimizationMigration1684654322000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "tokens"
        ALTER COLUMN "price" TYPE numeric(28,8) USING "price"::numeric,
        ALTER COLUMN "price" SET DEFAULT 0;
      `);

    await queryRunner.query(`
        ALTER TABLE "tokens"
        ALTER COLUMN "timestamp" SET DEFAULT CURRENT_TIMESTAMP(6);
      `);

    await queryRunner.query(`
        ALTER TABLE "tokens"
        ALTER COLUMN "lastpriceupdate" TYPE timestamptz USING "lastpriceupdate"::timestamptz,
        ALTER COLUMN "lastpriceupdate" SET DEFAULT CURRENT_TIMESTAMP(6);
      `);

    await queryRunner.query(`
        ALTER TABLE "tokens"
        ALTER COLUMN "name" TYPE varchar(128),
        ALTER COLUMN "symbol" TYPE varchar(32);
      `);

    await queryRunner.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'IDX_tokens_address') THEN
            CREATE INDEX "IDX_tokens_address" ON "tokens" ("address");
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'IDX_tokens_symbol') THEN
            CREATE INDEX "IDX_tokens_symbol" ON "tokens" ("symbol");
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'IDX_tokens_chain_id') THEN
            CREATE INDEX "IDX_tokens_chain_id" ON "tokens" ("chain_id");
          END IF;
        END
        $$;
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert type changes
    await queryRunner.query(`
    ALTER TABLE "tokens"
    ALTER COLUMN "price" TYPE numeric(28,0) USING "price"::numeric,
    ALTER COLUMN "price" SET DEFAULT 0;
  `);

    await queryRunner.query(`
    ALTER TABLE "tokens"
    ALTER COLUMN "timestamp" SET DEFAULT CURRENT_TIMESTAMP;
  `);

    await queryRunner.query(`
    ALTER TABLE "tokens"
    ALTER COLUMN "lastpriceupdate" TYPE timestamp USING "lastpriceupdate"::timestamp,
    ALTER COLUMN "lastpriceupdate" SET DEFAULT CURRENT_TIMESTAMP;
  `);

    await queryRunner.query(`
    ALTER TABLE "tokens"
    ALTER COLUMN "name" TYPE varchar,
    ALTER COLUMN "symbol" TYPE varchar;
  `);
  }
}
