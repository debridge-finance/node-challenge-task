import { MigrationInterface, QueryRunner } from 'typeorm';

export class ColumnsRename1760215591185 implements MigrationInterface {
  name = 'ColumnsRename1760215591185';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tokens" DROP COLUMN "chain_deid"`);

    await queryRunner.query(`
      ALTER TABLE "tokens"
      RENAME COLUMN "chain_isenabled" TO "chain_is_enabled"
    `);

    await queryRunner.query(`
      ALTER TABLE "tokens"
      RENAME COLUMN "lastUpdateAuthor" TO "last_update_author"
    `);

    await queryRunner.query(`
      ALTER TABLE "tokens"
      RENAME COLUMN "isNative" TO "is_native"
    `);

    await queryRunner.query(`
      ALTER TABLE "tokens"
      RENAME COLUMN "lastPriceUpdate" TO "last_price_update"
    `);

    await queryRunner.query(`
      ALTER TABLE "tokens"
      RENAME COLUMN "isProtected" TO "is_protected"
    `);

    await queryRunner.query(`
      ALTER TABLE "tokens"
      RENAME COLUMN "logo_tokenid" TO "logo_token_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "tokens"
      RENAME COLUMN "logo_bigrelativepath" TO "logo_big_relative_path"
    `);

    await queryRunner.query(`
      ALTER TABLE "tokens"
      RENAME COLUMN "logo_smallrelativepath" TO "logo_small_relative_path"
    `);

    await queryRunner.query(`
      ALTER TABLE "tokens"
      RENAME COLUMN "logo_thumbrelativepath" TO "logo_thumb_relative_path"
    `);

    await queryRunner.query(`
      ALTER TABLE "tokens"
      ALTER COLUMN "decimals" SET DEFAULT 0,
      ALTER COLUMN "is_native" SET DEFAULT false,
      ALTER COLUMN "is_protected" SET DEFAULT false,
      ALTER COLUMN "priority" SET DEFAULT 0,
      ALTER COLUMN "timestamp" SET DEFAULT CURRENT_TIMESTAMP,
      ALTER COLUMN "chain_is_enabled" SET DEFAULT true,
      ALTER COLUMN "price" SET DEFAULT 0,
      ALTER COLUMN "last_price_update" SET DEFAULT CURRENT_TIMESTAMP
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "tokens"
      ALTER COLUMN "decimals" DROP DEFAULT,
      ALTER COLUMN "is_native" DROP DEFAULT,
      ALTER COLUMN "is_protected" DROP DEFAULT,
      ALTER COLUMN "priority" DROP DEFAULT,
      ALTER COLUMN "timestamp" DROP DEFAULT,
      ALTER COLUMN "chain_is_enabled" DROP DEFAULT,
      ALTER COLUMN "price" DROP DEFAULT,
      ALTER COLUMN "last_price_update" DROP DEFAULT
    `);

    await queryRunner.query(`
      ALTER TABLE "tokens"
      RENAME COLUMN "logo_thumb_relative_path" TO "logo_thumbrelativepath"
    `);
    await queryRunner.query(`
      ALTER TABLE "tokens" 
      RENAME COLUMN "is_native" TO "isNative"`);
    await queryRunner.query(`
      ALTER TABLE "tokens"
      RENAME COLUMN "last_update_author" TO "lastUpdateAuthor"
    `);
    await queryRunner.query(`
      ALTER TABLE "tokens"
      RENAME COLUMN "is_protected" TO "isProtected"
    `);
    await queryRunner.query(`
      ALTER TABLE "tokens" 
      RENAME COLUMN "last_price_update" TO "lastPriceUpdate"
    `);
    await queryRunner.query(`
      ALTER TABLE "tokens" 
      RENAME COLUMN "logo_small_relative_path" TO "logo_smallrelativepath"
    `);
    await queryRunner.query(`
      ALTER TABLE "tokens" 
      RENAME COLUMN "logo_big_relative_path" TO "logo_bigrelativepath"
    `);
    await queryRunner.query(`
      ALTER TABLE "tokens"
      RENAME COLUMN "logo_token_id" TO "logo_tokenid"
    `);
    await queryRunner.query(`
      ALTER TABLE "tokens" 
      RENAME COLUMN "chain_is_enabled" TO "chain_isenabled"
    `);
    await queryRunner.query(`
      ALTER TABLE "tokens"
      ADD COLUMN "chain_deid" numeric NOT NULL DEFAULT 0
    `);
  }
}
