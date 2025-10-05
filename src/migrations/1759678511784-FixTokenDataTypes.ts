import { MigrationInterface, QueryRunner } from "typeorm";

export class FixTokenDataTypes1759678511784 implements MigrationInterface {
    name = 'FixTokenDataTypes1759678511784'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // First, alter the price column from decimal(28,0) to decimal(18,8)
        await queryRunner.query(`ALTER TABLE "tokens" ALTER COLUMN "price" TYPE decimal(18,8) USING price::decimal(18,8)`);
        
        // Convert address from bytea to varchar
        // First, create a temporary column
        await queryRunner.query(`ALTER TABLE "tokens" ADD COLUMN "address_temp" character varying`);
        
        // Convert existing bytea addresses to hex strings
        await queryRunner.query(`UPDATE "tokens" SET "address_temp" = '0x' || encode("address", 'hex')`);
        
        // Drop the old column and rename the new one
        await queryRunner.query(`ALTER TABLE "tokens" DROP COLUMN "address"`);
        await queryRunner.query(`ALTER TABLE "tokens" RENAME COLUMN "address_temp" TO "address"`);
        
        // Make address NOT NULL since it should always have a value
        await queryRunner.query(`ALTER TABLE "tokens" ALTER COLUMN "address" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert price column back to decimal(28,0)
        await queryRunner.query(`ALTER TABLE "tokens" ALTER COLUMN "price" TYPE decimal(28,0) USING price::decimal(28,0)`);
        
        // Revert address from varchar back to bytea
        // First, create a temporary column
        await queryRunner.query(`ALTER TABLE "tokens" ADD COLUMN "address_temp" bytea`);
        
        // Convert hex strings back to bytea (remove '0x' prefix if present)
        await queryRunner.query(`UPDATE "tokens" SET "address_temp" = decode(CASE WHEN "address" LIKE '0x%' THEN substring("address" from 3) ELSE "address" END, 'hex')`);
        
        // Drop the old column and rename the new one
        await queryRunner.query(`ALTER TABLE "tokens" DROP COLUMN "address"`);
        await queryRunner.query(`ALTER TABLE "tokens" RENAME COLUMN "address_temp" TO "address"`);
        
        // Make address NOT NULL
        await queryRunner.query(`ALTER TABLE "tokens" ALTER COLUMN "address" SET NOT NULL`);
    }

}