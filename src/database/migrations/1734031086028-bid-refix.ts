import { MigrationInterface, QueryRunner } from 'typeorm';

export class BidRefix1734031086028 implements MigrationInterface {
  name = 'BidRefix1734031086028';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auction" ADD "current_bid" numeric(18,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" ADD "highest_bid" numeric(18,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "bid" ADD "created_by_method" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "bid" ADD "current_bid" numeric(18,2)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "bid" DROP COLUMN "current_bid"`);
    await queryRunner.query(
      `ALTER TABLE "bid" DROP COLUMN "created_by_method"`,
    );
    await queryRunner.query(`ALTER TABLE "auction" DROP COLUMN "highest_bid"`);
    await queryRunner.query(`ALTER TABLE "auction" DROP COLUMN "current_bid"`);
  }
}
