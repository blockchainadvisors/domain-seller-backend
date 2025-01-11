import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentIntentToPayment1736606180001
  implements MigrationInterface
{
  name = 'AddPaymentIntentToPayment1736606180001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payment" ADD "payment_intent" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payment" DROP COLUMN "payment_intent"`,
    );
  }
}
