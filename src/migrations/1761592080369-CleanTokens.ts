import { MigrationInterface, QueryRunner } from 'typeorm';

export class CleanTokens1761592080369 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "tokens" DROP COLUMN "chain_id"');
    await queryRunner.query('ALTER TABLE "tokens" DROP COLUMN "chain_deid"');
    await queryRunner.query('ALTER TABLE "tokens" DROP COLUMN "chain_name"');
    await queryRunner.query('ALTER TABLE "tokens" DROP COLUMN "chain_isenabled"');
    await queryRunner.query('ALTER TABLE "tokens" DROP COLUMN "logo_id"');
    await queryRunner.query('ALTER TABLE "tokens" DROP COLUMN "logo_tokenid"');
    await queryRunner.query('ALTER TABLE "tokens" DROP COLUMN "logo_bigrelativepath"');
    await queryRunner.query('ALTER TABLE "tokens" DROP COLUMN "logo_smallrelativepath"');
    await queryRunner.query('ALTER TABLE "tokens" DROP COLUMN "logo_thumbrelativepath"');
    await queryRunner.query('ALTER TABLE "tokens" DROP COLUMN "price"');
    await queryRunner.query('ALTER TABLE "tokens" DROP COLUMN "lastPriceUpdate"');
    await queryRunner.query('ALTER TABLE "tokens" RENAME COlUMN "chainId" TO "chain_id"');
    await queryRunner.query('ALTER TABLE "tokens" RENAME COLUMN "isNative" TO "is_native"');
    await queryRunner.query('ALTER TABLE "tokens" RENAME COLUMN "isProtected" TO "is_protected"');
    await queryRunner.query('ALTER TABLE "tokens" RENAME COLUMN "lastUpdateAuthor" TO "last_update_author"');
    await queryRunner.query('ALTER TABLE "tokens" RENAME COLUMN "timestamp" TO "created_at"');
    await queryRunner.query('ALTER TABLE "tokens" ALTER COLUMN "created_at" TYPE timestamptz');
    await queryRunner.query('ALTER TABLE "tokens" ALTER COLUMN "created_at" SET DEFAULT NOW()');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "tokens" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP');
    await queryRunner.query('ALTER TABLE "tokens" ALTER COLUMN "created_at" TYPE TIMESTAMP');
    await queryRunner.query('ALTER TABLE "tokens" RENAME COLUMN "created_at" TO "timestamp"');
    await queryRunner.query('ALTER TABLE "tokens" RENAME COLUMN "last_update_author" TO "lastUpdateAuthor"');
    await queryRunner.query('ALTER TABLE "tokens" RENAME COLUMN "is_protected" TO "isProtected"');
    await queryRunner.query('ALTER TABLE "tokens" RENAME COLUMN "is_native" TO "isNative"');
    await queryRunner.query('ALTER TABLE "tokens" RENAME COlUMN "chain_id" TO "chainId"');
    await queryRunner.query('ALTER TABLE "tokens" ADD COLUMN "lastPriceUpdate" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP');
    await queryRunner.query('ALTER TABLE "tokens" ADD COLUMN "price" numeric(28,0) NOT NULL DEFAULT \'0\'');
    await queryRunner.query('ALTER TABLE "tokens" ADD COLUMN "logo_thumbrelativepath" character varying');
    await queryRunner.query('ALTER TABLE "tokens" ADD COLUMN "logo_smallrelativepath" character varying');
    await queryRunner.query('ALTER TABLE "tokens" ADD COLUMN "logo_bigrelativepath" character varying');
    await queryRunner.query('ALTER TABLE "tokens" ADD COLUMN "logo_tokenid" uuid');
    await queryRunner.query('ALTER TABLE "tokens" ADD COLUMN "logo_id" uuid');
    await queryRunner.query('ALTER TABLE "tokens" ADD COLUMN "chain_isenabled" boolean NOT NULL DEFAULT true');
    await queryRunner.query('ALTER TABLE "tokens" ADD COLUMN "chain_name" character varying');
    await queryRunner.query('ALTER TABLE "tokens" ADD COLUMN "chain_deid" numeric');
    await queryRunner.query('ALTER TABLE "tokens" ADD COLUMN "chain_id" uuid');

    await queryRunner.query(`
      UPDATE tokens
      SET (chain_id, chain_deid, chain_isenabled, chain_name) = (SELECT id, de_id, is_enabled, name FROM chains WHERE chains.id = tokens."chainId")
    `);
    await queryRunner.query(`
      UPDATE tokens
      SET (logo_id, logo_tokenid, logo_bigrelativepath, logo_smallrelativepath, logo_thumbrelativepath) =
      (SELECT id, token_id, big_relative_path, small_relative_path, thumb_relative_path FROM logos WHERE logos.token_id = tokens.id)
    `);
    await queryRunner.query(`
      UPDATE tokens
      SET (price, "lastPriceUpdate") = (SELECT price, updated_at FROM prices WHERE prices.token_id = tokens.id)
    `);
    await queryRunner.query('ALTER TABLE "tokens" ALTER COLUMN "chain_id" SET NOT NULL');
    await queryRunner.query('ALTER TABLE "tokens" ALTER COLUMN "chain_deid" SET NOT NULL');
    await queryRunner.query('ALTER TABLE "tokens" ALTER COLUMN "chain_name" SET NOT NULL');
  }
}
