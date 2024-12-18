import { MigrationInterface, QueryRunner } from 'typeorm';

export class BidLogsTable1734447628207 implements MigrationInterface {
  name = 'BidLogsTable1734447628207';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "bid_logs" ("bidder" character varying NOT NULL, "amount" integer NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "bid_id" uuid, CONSTRAINT "PK_15674b1daeb66c3911c4aff48cc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "bid_logs" ADD CONSTRAINT "FK_f730caf0d808efae4e26da74e8c" FOREIGN KEY ("bid_id") REFERENCES "bid"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bid_logs" DROP CONSTRAINT "FK_f730caf0d808efae4e26da74e8c"`,
    );
    await queryRunner.query(`DROP TABLE "bid_logs"`);
  }
}
