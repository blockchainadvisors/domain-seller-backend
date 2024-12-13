import { MigrationInterface, QueryRunner } from 'typeorm';

export class WinningBidId1734093464626 implements MigrationInterface {
  name = 'WinningBidId1734093464626';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auction" ADD "winning_bid_id" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auction" DROP COLUMN "winning_bid_id"`,
    );
  }
}
