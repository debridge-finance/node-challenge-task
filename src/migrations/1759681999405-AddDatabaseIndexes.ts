import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDatabaseIndexes1759681999405 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create index for token lookup by address and chainId
        // This is a unique combination, so we can make it a unique index
        await queryRunner.query(`
            CREATE UNIQUE INDEX idx_tokens_address_chain 
            ON tokens (address, "chainId")
        `);

        // Create index for chainId foreign key
        // This will speed up joins with chains table
        await queryRunner.query(`
            CREATE INDEX idx_tokens_chain_id 
            ON tokens ("chainId")
        `);

        // Create index for lastPriceUpdate to optimize sorting/filtering by update time
        await queryRunner.query(`
            CREATE INDEX idx_tokens_last_price_update 
            ON tokens ("lastPriceUpdate")
        `);

        // Optional: Create index for price queries if we need to filter/sort by price
        await queryRunner.query(`
            CREATE INDEX idx_tokens_price 
            ON tokens (price)
        `);

        // Optional: Create covering index for batch processing of price updates
        // This includes all fields typically accessed during price updates
        await queryRunner.query(`
            CREATE INDEX idx_tokens_price_update_batch 
            ON tokens (id, price, "lastPriceUpdate") 
            INCLUDE (symbol, address, "chainId")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes in reverse order
        await queryRunner.query(`DROP INDEX IF EXISTS idx_tokens_price_update_batch`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_tokens_price`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_tokens_last_price_update`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_tokens_chain_id`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_tokens_address_chain`);
    }
}