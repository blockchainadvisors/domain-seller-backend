import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentUrlToPayment1734098607502 implements MigrationInterface {
  name = 'AddPaymentUrlToPayment1734098607502';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payment" ADD "payment_url" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "payment_url"`);
  }
}
