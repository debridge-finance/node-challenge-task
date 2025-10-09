import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1684654321000 implements MigrationInterface {
    name = 'InitialMigration1684654321000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "logos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tokenId" uuid, "bigRelativePath" character varying NOT NULL, "smallRelativePath" character varying NOT NULL, "thumbRelativePath" character varying NOT NULL, CONSTRAINT "PK_31b54869640913345a8087adf13" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "chains" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "deId" numeric NOT NULL, "name" character varying NOT NULL, "isEnabled" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_f3c6ca7e7ad0f451e3b8f3dd378" PRIMARY KEY ("id"))`);

        await queryRunner.query(`
            CREATE TABLE "tokens" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "address" bytea NOT NULL,
                "symbol" character varying,
                "name" character varying,
                "decimals" smallint NOT NULL DEFAULT '0',
                "isNative" boolean NOT NULL DEFAULT false,
                "isProtected" boolean NOT NULL DEFAULT false,
                "lastUpdateAuthor" character varying,
                "priority" integer NOT NULL DEFAULT '0',
                "timestamp" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "chain_id" uuid NOT NULL,
                "logo_id" uuid NOT NULL,
                "price" numeric(28,0) NOT NULL DEFAULT '0',
                "lastPriceUpdate" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "PK_tokens" PRIMARY KEY ("id"),
                CONSTRAINT "FK_tokens_chain" FOREIGN KEY ("chain_id") REFERENCES "chains" ("id"),
                CONSTRAINT "FK_tokens_logo" FOREIGN KEY ("logo_id") REFERENCES "logos" ("id")
            )
        `);
        
        // Create extension for UUID generation if it doesn't exist
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "tokens"`);
        await queryRunner.query(`DROP TABLE "chains"`);
        await queryRunner.query(`DROP TABLE "logos"`);
    }
}
