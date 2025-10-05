import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOutboxTable1759678113262 implements MigrationInterface {
    name = 'AddOutboxTable1759678113262'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."outbox_events_status_enum" AS ENUM('PENDING', 'SENT', 'FAILED')`);
        await queryRunner.query(`CREATE TABLE "outbox_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "aggregateId" character varying(100) NOT NULL, "eventType" character varying(100) NOT NULL, "payload" jsonb NOT NULL, "status" "public"."outbox_events_status_enum" NOT NULL DEFAULT 'PENDING', "retryCount" integer NOT NULL DEFAULT '0', "processedAt" TIMESTAMP, "error" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6689a16c00d09b8089f6237f1d2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e10d0e4896a0f24c546f88b84f" ON "outbox_events" ("status", "createdAt") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_e10d0e4896a0f24c546f88b84f"`);
        await queryRunner.query(`DROP TABLE "outbox_events"`);
        await queryRunner.query(`DROP TYPE "public"."outbox_events_status_enum"`);
    }

}
