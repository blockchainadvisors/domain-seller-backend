import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixMinpriceToAuction1732045411296 implements MigrationInterface {
  name = 'FixMinpriceToAuction1732045411296';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auction" ADD "min_price" numeric(18,2)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "auction" DROP COLUMN "min_price"`);
  }
}
