import { MigrationInterface, QueryRunner } from 'typeorm';

export class FullSchmaSetup1730931302981 implements MigrationInterface {
  name = 'FullSchmaSetup1730931302981';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "notification" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "domain" ("current_highest_bid" integer, "status" character varying NOT NULL, "description" character varying, "url" character varying NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_27e3ec3ea0ae02c8c5bceab3ba9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "auction" ("min_increment" integer NOT NULL, "reserve_price" integer NOT NULL, "end_time" TIMESTAMP NOT NULL, "start_time" TIMESTAMP NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "domainIdId" uuid NOT NULL, CONSTRAINT "REL_eade260f03db81f0f2770e0705" UNIQUE ("domainIdId"), CONSTRAINT "PK_9dc876c629273e71646cf6dfa67" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "bid" ("amount" integer NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userIdId" integer, "domainIdId" uuid, "auctionIdId" uuid, CONSTRAINT "PK_ed405dda320051aca2dcb1a50bb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "payment" ("status" character varying NOT NULL, "stripe_id" character varying, "amount" integer NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userIdId" integer, "bidIdId" uuid, CONSTRAINT "PK_fcaec7df5adf9cac408c686b2ab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" ADD CONSTRAINT "FK_eade260f03db81f0f2770e07058" FOREIGN KEY ("domainIdId") REFERENCES "domain"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bid" ADD CONSTRAINT "FK_40ae01acfb7a564ead705c3502a" FOREIGN KEY ("userIdId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bid" ADD CONSTRAINT "FK_aa471f5e286f6e415b443d0f364" FOREIGN KEY ("domainIdId") REFERENCES "domain"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bid" ADD CONSTRAINT "FK_ca1b5dcc81a6a4147ba80c37263" FOREIGN KEY ("auctionIdId") REFERENCES "auction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment" ADD CONSTRAINT "FK_3dd21505bf38aeefe2e7fe6d404" FOREIGN KEY ("userIdId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment" ADD CONSTRAINT "FK_887dfa15995572f88544d7705dc" FOREIGN KEY ("bidIdId") REFERENCES "bid"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payment" DROP CONSTRAINT "FK_887dfa15995572f88544d7705dc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment" DROP CONSTRAINT "FK_3dd21505bf38aeefe2e7fe6d404"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bid" DROP CONSTRAINT "FK_ca1b5dcc81a6a4147ba80c37263"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bid" DROP CONSTRAINT "FK_aa471f5e286f6e415b443d0f364"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bid" DROP CONSTRAINT "FK_40ae01acfb7a564ead705c3502a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" DROP CONSTRAINT "FK_eade260f03db81f0f2770e07058"`,
    );
    await queryRunner.query(`DROP TABLE "payment"`);
    await queryRunner.query(`DROP TABLE "bid"`);
    await queryRunner.query(`DROP TABLE "auction"`);
    await queryRunner.query(`DROP TABLE "domain"`);
    await queryRunner.query(`DROP TABLE "notification"`);
  }
}
