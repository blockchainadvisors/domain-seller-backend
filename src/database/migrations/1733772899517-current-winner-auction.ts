import { MigrationInterface, QueryRunner } from 'typeorm';

export class CurrentWinnerAuction1733772899517 implements MigrationInterface {
  name = 'CurrentWinnerAuction1733772899517';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auction" ADD "current_winner" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auction" DROP COLUMN "current_winner"`,
    );
  }
}
