import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFeedTable1684654321001 implements MigrationInterface {
  name = 'CreateFeedTable1684654321001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `SELECT pg_advisory_lock(hashtext('typeorm_migrations'), hashtext('${this.name}'))`,
    );
    await queryRunner.startTransaction();
    try {
      await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

      await queryRunner.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'feed_status_enum') THEN
            CREATE TYPE feed_status_enum AS ENUM ('pending', 'processing', 'processed', 'failed');
          END IF;
        END
        $$;
      `);

      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS feed (
          id uuid NOT NULL DEFAULT uuid_generate_v4(),
          token_id uuid NOT NULL,
          status feed_status_enum NOT NULL DEFAULT 'pending',
          error character varying,
          old_price numeric(28,0) NOT NULL DEFAULT 0,
          new_price numeric(28,0) NOT NULL DEFAULT 0,
          created_at TIMESTAMP NOT NULL DEFAULT now(),
          updated_at TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT PK_feed PRIMARY KEY (id)
        )
      `);

      await queryRunner.query(`
        CREATE OR REPLACE FUNCTION update_token_price()
        RETURNS TRIGGER AS $$
        BEGIN
          IF NEW.status = 'processed' AND NEW.new_price IS NOT NULL THEN
            UPDATE tokens
            SET price = NEW.new_price,
                last_price_update = NOW()
            WHERE id = NEW.token_id;
          END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `);

      await queryRunner.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1
            FROM pg_trigger
            WHERE tgname = 'trg_update_token_price'
          ) THEN
            CREATE TRIGGER trg_update_token_price
            AFTER INSERT OR UPDATE ON feed
            FOR EACH ROW
            EXECUTE FUNCTION update_token_price();
          END IF;
        END
        $$;
      `);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.query(
        `SELECT pg_advisory_unlock(hashtext('typeorm_migrations'), hashtext('${this.name}'))`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `SELECT pg_advisory_lock(hashtext('typeorm_migrations'), hashtext('${this.name}_down'))`,
    );
    await queryRunner.startTransaction();
    try {
      await queryRunner.query(`DROP TRIGGER IF EXISTS trg_update_token_price ON feed`);
      await queryRunner.query(`DROP FUNCTION IF EXISTS update_token_price`);
      await queryRunner.query(`DROP TABLE IF EXISTS feed`);
      await queryRunner.query(`
        DO $$
        BEGIN
          IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'feed_status_enum') THEN
            DROP TYPE feed_status_enum;
          END IF;
        END
        $$;
      `);
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.query(
        `SELECT pg_advisory_unlock(hashtext('typeorm_migrations'), hashtext('${this.name}_down'))`,
      );
    }
  }
}
