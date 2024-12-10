import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLeaseToAuction1733826333876 implements MigrationInterface {
  name = 'AddLeaseToAuction1733826333876';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "domain" ADD "current_owner" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" ADD "lease_price" numeric(18,2)`,
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
  }
}
