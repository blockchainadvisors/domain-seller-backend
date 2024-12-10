import { MigrationInterface, QueryRunner } from 'typeorm';

export class FullSchema1733852375836 implements MigrationInterface {
  name = 'FullSchema1733852375836';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auction" DROP COLUMN "payment_created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "domain" ADD "current_owner" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" ADD "lease_price" numeric(18,2) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" ADD "expiry_duration" numeric(18,2) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auction" DROP COLUMN "expiry_duration"`,
    );
    await queryRunner.query(`ALTER TABLE "auction" DROP COLUMN "lease_price"`);
    await queryRunner.query(`ALTER TABLE "domain" DROP COLUMN "current_owner"`);
    await queryRunner.query(
      `ALTER TABLE "auction" ADD "payment_created_at" TIMESTAMP`,
    );
  }
}
