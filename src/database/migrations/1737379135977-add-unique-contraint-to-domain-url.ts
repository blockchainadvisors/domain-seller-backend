import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueContraintToDomainUrl1737379135977
  implements MigrationInterface
{
  name = 'AddUniqueContraintToDomainUrl1737379135977';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "domain" ADD CONSTRAINT "UQ_a46966ef3c0ccb61d5496c9ace2" UNIQUE ("url")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "domain" DROP CONSTRAINT "UQ_a46966ef3c0ccb61d5496c9ace2"`,
    );
  }
}
