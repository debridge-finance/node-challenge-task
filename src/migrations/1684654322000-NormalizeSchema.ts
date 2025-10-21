import { MigrationInterface, QueryRunner } from "typeorm";

export class NormalizeSchema1684654322000 implements MigrationInterface {
    name = 'NormalizeSchema1684654322000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create chains table
        await queryRunner.query(`
            CREATE TABLE "chains" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "deid" bigint NOT NULL,
                "name" character varying NOT NULL,
                "isEnabled" boolean NOT NULL DEFAULT true,
                CONSTRAINT "UQ_chain_deid" UNIQUE ("deid"),
                CONSTRAINT "PK_chains" PRIMARY KEY ("id")
            )
        `);
        
        // Create logos table
        await queryRunner.query(`
            CREATE TABLE "logos" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "tokenId" uuid,
                "bigRelativePath" character varying NOT NULL,
                "smallRelativePath" character varying NOT NULL,
                "thumbRelativePath" character varying NOT NULL,
                CONSTRAINT "PK_logos" PRIMARY KEY ("id")
            )
        `);
        
        // Migrate existing chain data from denormalized columns to chains table
        await queryRunner.query(`
            INSERT INTO "chains" ("id", "deid", "name", "isEnabled")
            SELECT DISTINCT 
                "chain_id"::uuid,
                "chain_deid"::bigint,
                "chain_name",
                "chain_isenabled"
            FROM "tokens"
            WHERE "chain_id" IS NOT NULL
            ON CONFLICT ("deid") DO NOTHING
        `);
        
        // Migrate existing logo data from denormalized columns to logos table
        await queryRunner.query(`
            INSERT INTO "logos" ("id", "tokenId", "bigRelativePath", "smallRelativePath", "thumbRelativePath")
            SELECT 
                "logo_id"::uuid,
                "logo_tokenid"::uuid,
                "logo_bigrelativepath",
                "logo_smallrelativepath",
                "logo_thumbrelativepath"
            FROM "tokens"
            WHERE "logo_id" IS NOT NULL
            ON CONFLICT DO NOTHING
        `);
        
        // Add logoId column to tokens table
        await queryRunner.query(`
            ALTER TABLE "tokens" ADD COLUMN IF NOT EXISTS "logoId" uuid
        `);
        
        // Update tokens table to reference the new logo records
        await queryRunner.query(`
            UPDATE "tokens"
            SET "logoId" = "logo_id"::uuid
            WHERE "logo_id" IS NOT NULL
        `);
        
        // Add foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "tokens"
            ADD CONSTRAINT "FK_tokens_chainId"
            FOREIGN KEY ("chainId") REFERENCES "chains"("id")
            ON DELETE RESTRICT ON UPDATE CASCADE
        `);
        
        await queryRunner.query(`
            ALTER TABLE "tokens"
            ADD CONSTRAINT "FK_tokens_logoId"
            FOREIGN KEY ("logoId") REFERENCES "logos"("id")
            ON DELETE SET NULL ON UPDATE CASCADE
        `);
        
        // Drop old denormalized columns from tokens table
        await queryRunner.query(`
            ALTER TABLE "tokens" 
            DROP COLUMN IF EXISTS "chain_id",
            DROP COLUMN IF EXISTS "chain_deid",
            DROP COLUMN IF EXISTS "chain_name",
            DROP COLUMN IF EXISTS "chain_isenabled",
            DROP COLUMN IF EXISTS "logo_id",
            DROP COLUMN IF EXISTS "logo_tokenid",
            DROP COLUMN IF EXISTS "logo_bigrelativepath",
            DROP COLUMN IF EXISTS "logo_smallrelativepath",
            DROP COLUMN IF EXISTS "logo_thumbrelativepath"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "tokens" DROP CONSTRAINT IF EXISTS "FK_tokens_chainId"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "tokens" DROP CONSTRAINT IF EXISTS "FK_tokens_logoId"
        `);
        
        // Remove logoId column
        await queryRunner.query(`
            ALTER TABLE "tokens" DROP COLUMN IF EXISTS "logoId"
        `);
        
        // Re-add denormalized columns
        await queryRunner.query(`
            ALTER TABLE "tokens"
            ADD COLUMN "chain_id" uuid,
            ADD COLUMN "chain_deid" numeric,
            ADD COLUMN "chain_name" character varying,
            ADD COLUMN "chain_isenabled" boolean DEFAULT true,
            ADD COLUMN "logo_id" uuid,
            ADD COLUMN "logo_tokenid" uuid,
            ADD COLUMN "logo_bigrelativepath" character varying,
            ADD COLUMN "logo_smallrelativepath" character varying,
            ADD COLUMN "logo_thumbrelativepath" character varying
        `);
        
        // Drop normalized tables
        await queryRunner.query(`DROP TABLE "logos"`);
        await queryRunner.query(`DROP TABLE "chains"`);
    }
}

