import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuctionIdTopayment1734522368849 implements MigrationInterface {
  name = 'AddAuctionIdTopayment1734522368849';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "payment" ADD "auction_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "payment" ADD CONSTRAINT "FK_332dbd28d38a2d9f53f7769f5d4" FOREIGN KEY ("auction_id") REFERENCES "auction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payment" DROP CONSTRAINT "FK_332dbd28d38a2d9f53f7769f5d4"`,
    );
    await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "auction_id"`);
  }
}
