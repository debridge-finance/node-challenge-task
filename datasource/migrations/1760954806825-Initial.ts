import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1760954806825 implements MigrationInterface {
    name = 'Initial1760954806825'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "item_logo" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "big_relative_path" character varying NOT NULL, "small_relative_path" character varying NOT NULL, "thumb_relative_path" character varying NOT NULL, CONSTRAINT "UQ_79e6c1a9ffe587dbd5e3b4dbf9c" UNIQUE ("big_relative_path"), CONSTRAINT "PK_fa2f1702099a5a5f49e9793f629" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_79e6c1a9ffe587dbd5e3b4dbf9" ON "item_logo" ("big_relative_path") `);
        await queryRunner.query(`CREATE TABLE "chain" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "blockchain_id" integer, "name" character varying NOT NULL, "slug" character varying NOT NULL, "is_enabled" boolean NOT NULL DEFAULT true, "logo_id" bigint, CONSTRAINT "PK_8e273aafae283b886672c952ecd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "token_prices" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "usd_price" numeric(28,18) NOT NULL DEFAULT '0', "last_updated_price_at" TIMESTAMP NOT NULL, "last_updated_price_by_source" character varying NOT NULL, CONSTRAINT "PK_42e2a1a31b88976beb8421f80f9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "token" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "address" character varying NOT NULL, "decimals" smallint NOT NULL, "is_native" boolean NOT NULL DEFAULT false, "is_protected" boolean NOT NULL DEFAULT false, "priority" integer NOT NULL DEFAULT '0', "token_price_id" bigint, "token_metadata_id" bigint NOT NULL, "logo_id" bigint NOT NULL, "chain_id" bigint NOT NULL, CONSTRAINT "PK_82fae97f905930df5d62a702fc9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_98e0e62905bf3179bdbf443735" ON "token" ("address", "chain_id") `);
        await queryRunner.query(`CREATE TABLE "token_metadata" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "symbol" character varying NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_69858f47995fd449579fa325054" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_945680d1847d03e76584da7f26" ON "token_metadata" ("name", "symbol") `);
        await queryRunner.query(`ALTER TABLE "chain" ADD CONSTRAINT "FK_ec2ca00fe34f7fad2d0c3e3fdf3" FOREIGN KEY ("logo_id") REFERENCES "item_logo"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "token" ADD CONSTRAINT "FK_ebfce529a9ee935bd4e2506c3b6" FOREIGN KEY ("token_price_id") REFERENCES "token_prices"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "token" ADD CONSTRAINT "FK_f1aa3f2402649093136b46d4427" FOREIGN KEY ("token_metadata_id") REFERENCES "token_metadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "token" ADD CONSTRAINT "FK_00a43f14d10b3c4e88d176f49f4" FOREIGN KEY ("logo_id") REFERENCES "item_logo"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "token" ADD CONSTRAINT "FK_de7e0d7203642a7985ad1e5bf97" FOREIGN KEY ("chain_id") REFERENCES "chain"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "token" DROP CONSTRAINT "FK_de7e0d7203642a7985ad1e5bf97"`);
        await queryRunner.query(`ALTER TABLE "token" DROP CONSTRAINT "FK_00a43f14d10b3c4e88d176f49f4"`);
        await queryRunner.query(`ALTER TABLE "token" DROP CONSTRAINT "FK_f1aa3f2402649093136b46d4427"`);
        await queryRunner.query(`ALTER TABLE "token" DROP CONSTRAINT "FK_ebfce529a9ee935bd4e2506c3b6"`);
        await queryRunner.query(`ALTER TABLE "chain" DROP CONSTRAINT "FK_ec2ca00fe34f7fad2d0c3e3fdf3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_945680d1847d03e76584da7f26"`);
        await queryRunner.query(`DROP TABLE "token_metadata"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_98e0e62905bf3179bdbf443735"`);
        await queryRunner.query(`DROP TABLE "token"`);
        await queryRunner.query(`DROP TABLE "token_prices"`);
        await queryRunner.query(`DROP TABLE "chain"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_79e6c1a9ffe587dbd5e3b4dbf9"`);
        await queryRunner.query(`DROP TABLE "item_logo"`);
    }

}
