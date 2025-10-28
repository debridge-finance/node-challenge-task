import { MigrationInterface, QueryRunner } from 'typeorm';

export class NormalizeLogos1761591998247 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
       CREATE TABLE "logos" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "token_id" uuid UNIQUE NOT NULL,
          "big_relative_path" varchar NOT NULL,
          "small_relative_path" varchar NOT NULL,
          "thumb_relative_path" varchar  NOT NULL,
          CONSTRAINT "PK_logos" PRIMARY KEY ("id")
       )
    `);

    await queryRunner.query(`
      INSERT INTO "logos" (id, token_id, big_relative_path, small_relative_path, thumb_relative_path)
      SELECT DISTINCT ON (logo_id)
        logo_id,
        logo_tokenid,
        logo_bigrelativepath,
        logo_smallrelativepath,
        logo_thumbrelativepath
      FROM "tokens"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "logos"');
  }
}
