import { MigrationInterface, QueryRunner } from "typeorm";

export class MigrateDataToNormalizedSchema1759440070537 implements MigrationInterface {
  name = "MigrateDataToNormalizedSchema1759440070537";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO logos ("bigRelativePath", "smallRelativePath", "thumbRelativePath")
      VALUES ('/logos/default/big.png', '/logos/default/small.png', '/logos/default/thumb.png')
      RETURNING id
    `);

    await queryRunner.query(`
      INSERT INTO price_feeds (name, description, "isActive", priority)
      VALUES ('Default Price Feed', 'Default price feed for existing tokens', true, 0)
      RETURNING id
    `);

    const defaultLogo = await queryRunner.query(`SELECT id FROM logos LIMIT 1`);
    const defaultPriceFeed = await queryRunner.query(`SELECT id FROM price_feeds LIMIT 1`);

    const logoId = defaultLogo[0]?.id;
    const priceFeedId = defaultPriceFeed[0]?.id;

    if (logoId && priceFeedId) {
      await queryRunner.query(
        `
        UPDATE tokens 
        SET "logoId" = $1, "priceFeedId" = $2, "symbolIndex" = UPPER(LEFT(symbol, 10)), "isActive" = true
        WHERE "logoId" IS NULL OR "priceFeedId" IS NULL
      `,
        [logoId, priceFeedId]
      );

      await queryRunner.query(`
        INSERT INTO logos ("bigRelativePath", "smallRelativePath", "thumbRelativePath")
        VALUES 
          ('/logos/usdc/big.png', '/logos/usdc/small.png', '/logos/usdc/thumb.png'),
          ('/logos/usdt/big.png', '/logos/usdt/small.png', '/logos/usdt/thumb.png'),
          ('/logos/eth/big.png', '/logos/eth/small.png', '/logos/eth/thumb.png')
        RETURNING id
      `);

      const usdcLogo = await queryRunner.query(
        `SELECT id FROM logos WHERE "bigRelativePath" = '/logos/usdc/big.png' LIMIT 1`
      );
      const usdtLogo = await queryRunner.query(
        `SELECT id FROM logos WHERE "bigRelativePath" = '/logos/usdt/big.png' LIMIT 1`
      );
      const ethLogo = await queryRunner.query(
        `SELECT id FROM logos WHERE "bigRelativePath" = '/logos/eth/big.png' LIMIT 1`
      );

      if (usdcLogo[0]?.id) {
        await queryRunner.query(`UPDATE tokens SET "logoId" = $1 WHERE UPPER(symbol) = 'USDC'`, [
          usdcLogo[0].id,
        ]);
      }
      if (usdtLogo[0]?.id) {
        await queryRunner.query(`UPDATE tokens SET "logoId" = $1 WHERE UPPER(symbol) = 'USDT'`, [
          usdtLogo[0].id,
        ]);
      }
      if (ethLogo[0]?.id) {
        await queryRunner.query(`UPDATE tokens SET "logoId" = $1 WHERE UPPER(symbol) = 'ETH'`, [
          ethLogo[0].id,
        ]);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE tokens SET "logoId" = NULL, "priceFeedId" = NULL`);

    await queryRunner.query(`DELETE FROM logos WHERE "bigRelativePath" LIKE '/logos/%'`);
    await queryRunner.query(`DELETE FROM price_feeds WHERE name = 'Default Price Feed'`);
  }
}
