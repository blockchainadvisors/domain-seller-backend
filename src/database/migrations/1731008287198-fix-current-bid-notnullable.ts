import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixCurrentBidNotnullable1731008287198
  implements MigrationInterface
{
  name = 'FixCurrentBidNotnullable1731008287198';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "domain" ALTER COLUMN "current_highest_bid" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "domain" ALTER COLUMN "current_highest_bid" SET NOT NULL`,
    );
  }
}
