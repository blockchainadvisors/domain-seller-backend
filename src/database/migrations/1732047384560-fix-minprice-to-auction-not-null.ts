import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixMinpriceToAuctionNotNull1732047384560
  implements MigrationInterface
{
  name = 'FixMinpriceToAuctionNotNull1732047384560';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auction" ALTER COLUMN "min_price" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auction" ALTER COLUMN "min_price" DROP NOT NULL`,
    );
  }
}
