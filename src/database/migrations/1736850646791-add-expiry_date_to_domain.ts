import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExpiryDateToDomain1736850646791 implements MigrationInterface {
  name = 'AddExpiryDateToDomain1736850646791';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "domain" ADD "expiry_date" TIMESTAMP`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "domain" DROP COLUMN "expiry_date"`);
  }
}
