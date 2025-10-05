import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from 'typeorm';

export class NormalizeDatabaseStructure1735123456789 implements MigrationInterface {
  name = 'NormalizeDatabaseStructure1735123456789';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create chains table
    await queryRunner.createTable(
      new Table({
        name: 'chains',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'debridgeId',
            type: 'integer',
            isUnique: true,
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'isEnabled',
            type: 'boolean',
            default: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    // Create logos table
    await queryRunner.createTable(
      new Table({
        name: 'logos',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'tokenId',
            type: 'uuid',
            isUnique: true,
          },
          {
            name: 'bigRelativePath',
            type: 'varchar',
          },
          {
            name: 'smallRelativePath',
            type: 'varchar',
          },
          {
            name: 'thumbRelativePath',
            type: 'varchar',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    // Migrate data from tokens table to chains table
    const tokens = await queryRunner.query('SELECT DISTINCT chain_id, chain_deid, chain_name, chain_isenabled FROM tokens');
    for (const token of tokens) {
      await queryRunner.query(
        `INSERT INTO chains (id, "debridgeId", name, "isEnabled") VALUES ($1, $2, $3, $4)`,
        [token.chain_id, token.chain_deid, token.chain_name, token.chain_isenabled]
      );
    }

    // Migrate data from tokens table to logos table
    const tokensWithLogos = await queryRunner.query('SELECT id, logo_id, logo_bigrelativepath, logo_smallrelativepath, logo_thumbrelativepath FROM tokens');
    for (const token of tokensWithLogos) {
      await queryRunner.query(
        `INSERT INTO logos (id, "tokenId", "bigRelativePath", "smallRelativePath", "thumbRelativePath") VALUES ($1, $2, $3, $4, $5)`,
        [token.logo_id, token.id, token.logo_bigrelativepath, token.logo_smallrelativepath, token.logo_thumbrelativepath]
      );
    }

    // Add foreign key constraint from tokens to chains
    await queryRunner.createForeignKey(
      'tokens',
      new TableForeignKey({
        columnNames: ['chainId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'chains',
        onDelete: 'CASCADE',
      })
    );

    // Add foreign key constraint from logos to tokens
    await queryRunner.createForeignKey(
      'logos',
      new TableForeignKey({
        columnNames: ['tokenId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tokens',
        onDelete: 'CASCADE',
      })
    );

    // Drop denormalized columns from tokens table
    await queryRunner.dropColumn('tokens', 'chain_id');
    await queryRunner.dropColumn('tokens', 'chain_deid');
    await queryRunner.dropColumn('tokens', 'chain_name');
    await queryRunner.dropColumn('tokens', 'chain_isenabled');
    await queryRunner.dropColumn('tokens', 'logo_id');
    await queryRunner.dropColumn('tokens', 'logo_tokenid');
    await queryRunner.dropColumn('tokens', 'logo_bigrelativepath');
    await queryRunner.dropColumn('tokens', 'logo_smallrelativepath');
    await queryRunner.dropColumn('tokens', 'logo_thumbrelativepath');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add denormalized columns back to tokens table
    await queryRunner.addColumn('tokens', new TableColumn({
      name: 'chain_id',
      type: 'uuid',
    }));
    await queryRunner.addColumn('tokens', new TableColumn({
      name: 'chain_deid',
      type: 'decimal',
    }));
    await queryRunner.addColumn('tokens', new TableColumn({
      name: 'chain_name',
      type: 'varchar',
    }));
    await queryRunner.addColumn('tokens', new TableColumn({
      name: 'chain_isenabled',
      type: 'boolean',
      default: true,
    }));
    await queryRunner.addColumn('tokens', new TableColumn({
      name: 'logo_id',
      type: 'uuid',
    }));
    await queryRunner.addColumn('tokens', new TableColumn({
      name: 'logo_tokenid',
      type: 'uuid',
      isNullable: true,
    }));
    await queryRunner.addColumn('tokens', new TableColumn({
      name: 'logo_bigrelativepath',
      type: 'varchar',
    }));
    await queryRunner.addColumn('tokens', new TableColumn({
      name: 'logo_smallrelativepath',
      type: 'varchar',
    }));
    await queryRunner.addColumn('tokens', new TableColumn({
      name: 'logo_thumbrelativepath',
      type: 'varchar',
    }));

    // Restore data from normalized tables
    const tokensWithRelations = await queryRunner.query(`
      SELECT t.id, c.id as chain_id, c."debridgeId", c.name as chain_name, c."isEnabled",
             l.id as logo_id, l."bigRelativePath", l."smallRelativePath", l."thumbRelativePath"
      FROM tokens t
      JOIN chains c ON t."chainId" = c.id
      LEFT JOIN logos l ON l."tokenId" = t.id
    `);

    for (const token of tokensWithRelations) {
      await queryRunner.query(`
        UPDATE tokens 
        SET chain_id = $2, chain_deid = $3, chain_name = $4, chain_isenabled = $5,
            logo_id = $6, logo_tokenid = $7, logo_bigrelativepath = $8, 
            logo_smallrelativepath = $9, logo_thumbrelativepath = $10
        WHERE id = $1
      `, [
        token.id,
        token.chain_id,
        token.debridgeId,
        token.chain_name,
        token.isEnabled,
        token.logo_id,
        token.id, // logo_tokenid = token.id
        token.bigRelativePath,
        token.smallRelativePath,
        token.thumbRelativePath
      ]);
    }

    // Drop foreign keys
    const table = await queryRunner.getTable('tokens');
    const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf('chainId') !== -1);
    if (foreignKey) {
      await queryRunner.dropForeignKey('tokens', foreignKey);
    }

    const logoTable = await queryRunner.getTable('logos');
    const logoForeignKey = logoTable.foreignKeys.find(fk => fk.columnNames.indexOf('tokenId') !== -1);
    if (logoForeignKey) {
      await queryRunner.dropForeignKey('logos', logoForeignKey);
    }

    // Drop tables
    await queryRunner.dropTable('logos');
    await queryRunner.dropTable('chains');
  }
}