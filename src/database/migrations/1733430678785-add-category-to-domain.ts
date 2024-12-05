import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCategoryToDomain1733430678785 implements MigrationInterface {
  name = 'AddCategoryToDomain1733430678785';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "domain" ADD "category" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "domain" DROP COLUMN "category"`);
  }
}
