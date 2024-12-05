import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentCreatedAt1733245807867 implements MigrationInterface {
  name = 'AddPaymentCreatedAt1733245807867';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auction" ADD "payment_created_at" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auction" DROP COLUMN "payment_created_at"`,
    );
  }
}
