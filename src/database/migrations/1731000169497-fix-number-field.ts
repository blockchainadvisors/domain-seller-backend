import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixNumberField1731000169497 implements MigrationInterface {
  name = 'FixNumberField1731000169497';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "domain" DROP COLUMN "current_highest_bid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "domain" ADD "current_highest_bid" numeric(18,2) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" DROP COLUMN "min_increment"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" ADD "min_increment" numeric(18,2) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" DROP COLUMN "reserve_price"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" ADD "reserve_price" numeric(18,2) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "bid" DROP COLUMN "amount"`);
    await queryRunner.query(
      `ALTER TABLE "bid" ADD "amount" numeric(18,2) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "amount"`);
    await queryRunner.query(
      `ALTER TABLE "payment" ADD "amount" numeric(18,2) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "amount"`);
    await queryRunner.query(
      `ALTER TABLE "payment" ADD "amount" integer NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "bid" DROP COLUMN "amount"`);
    await queryRunner.query(`ALTER TABLE "bid" ADD "amount" integer NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "auction" DROP COLUMN "reserve_price"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" ADD "reserve_price" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" DROP COLUMN "min_increment"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" ADD "min_increment" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "domain" DROP COLUMN "current_highest_bid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "domain" ADD "current_highest_bid" integer`,
    );
  }
}
