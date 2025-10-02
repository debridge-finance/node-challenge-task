import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1759384150956 implements MigrationInterface {
    name = 'Init1759384150956'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "chain_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "de_id" bigint NOT NULL, "name" character varying NOT NULL, "is_enabled" boolean NOT NULL, CONSTRAINT "UQ_d49952d14b829bf243ed20e1a40" UNIQUE ("de_id"), CONSTRAINT "PK_727bd04fbc05cee615f89b07fd1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "token_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "chain_id" uuid NOT NULL, "address" bytea NOT NULL, "symbol" character varying, "name" character varying, "decimals" smallint NOT NULL DEFAULT '0', "is_native" boolean NOT NULL DEFAULT false, "is_protected" boolean NOT NULL DEFAULT false, "priority" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_by" character varying, CONSTRAINT "PK_687443f2a51af49b5472e2c5ddc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "token-logos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "token_id" uuid, "big_relative_path" character varying NOT NULL, "small_relative_path" character varying NOT NULL, "thumb_relative_path" character varying NOT NULL, CONSTRAINT "PK_1a5b7d7ed3d8b7329bb1f90410c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "token-prices" ("token_id" uuid NOT NULL, "price" numeric(28,0) NOT NULL DEFAULT '0', "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "tokenId" uuid, CONSTRAINT "PK_38ed90b3575423fe4c86c184341" PRIMARY KEY ("token_id"))`);
        await queryRunner.query(`ALTER TABLE "token_entity" ADD CONSTRAINT "token_to_chain_fk" FOREIGN KEY ("chain_id") REFERENCES "chain_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "token-prices" ADD CONSTRAINT "token_price_to_token_fk" FOREIGN KEY ("tokenId") REFERENCES "token_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "token-prices" DROP CONSTRAINT "token_price_to_token_fk"`);
        await queryRunner.query(`ALTER TABLE "token_entity" DROP CONSTRAINT "token_to_chain_fk"`);
        await queryRunner.query(`DROP TABLE "token-prices"`);
        await queryRunner.query(`DROP TABLE "token-logos"`);
        await queryRunner.query(`DROP TABLE "token_entity"`);
        await queryRunner.query(`DROP TABLE "chain_entity"`);
    }

}
