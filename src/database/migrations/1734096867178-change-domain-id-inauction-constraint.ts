import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeDomainIdInauctionConstraint1734096867178
  implements MigrationInterface
{
  name = 'ChangeDomainIdInauctionConstraint1734096867178';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auction" DROP CONSTRAINT "FK_881d398e297dca8d2cacf7187b8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" DROP CONSTRAINT "REL_881d398e297dca8d2cacf7187b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" ADD CONSTRAINT "FK_881d398e297dca8d2cacf7187b8" FOREIGN KEY ("domain_id") REFERENCES "domain"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auction" DROP CONSTRAINT "FK_881d398e297dca8d2cacf7187b8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" ADD CONSTRAINT "REL_881d398e297dca8d2cacf7187b" UNIQUE ("domain_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" ADD CONSTRAINT "FK_881d398e297dca8d2cacf7187b8" FOREIGN KEY ("domain_id") REFERENCES "domain"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
