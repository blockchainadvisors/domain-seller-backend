import { MigrationInterface, QueryRunner } from 'typeorm';

export class DnsSetings1733593816854 implements MigrationInterface {
  name = 'DnsSetings1733593816854';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."dns_settings_dns_status_enum" AS ENUM('PENDING', 'UPDATED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."dns_settings_transfer_status_enum" AS ENUM('CREATED', 'ACCEPTED', 'CANCELLED', 'PENDING')`,
    );
    await queryRunner.query(
      `CREATE TABLE "dns_settings" ("owner_id" character varying NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "buyer_dns" jsonb, "buyer_nameservers" text array, "dns_status" "public"."dns_settings_dns_status_enum" NOT NULL DEFAULT 'PENDING', "transfer_status" "public"."dns_settings_transfer_status_enum" NOT NULL DEFAULT 'CREATED', "ownership_transferred" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, "bid_id" uuid, "domain_id" uuid, CONSTRAINT "PK_2985d03a582fe59fb1c4a61ed97" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "dns_settings" ADD CONSTRAINT "FK_5645d0ffa0ea9c1c5514e595f98" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "dns_settings" ADD CONSTRAINT "FK_530c90aa5090f5cc4eedb627472" FOREIGN KEY ("bid_id") REFERENCES "bid"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "dns_settings" ADD CONSTRAINT "FK_a3de351a467dde57039ef7049de" FOREIGN KEY ("domain_id") REFERENCES "domain"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dns_settings" DROP CONSTRAINT "FK_a3de351a467dde57039ef7049de"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dns_settings" DROP CONSTRAINT "FK_530c90aa5090f5cc4eedb627472"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dns_settings" DROP CONSTRAINT "FK_5645d0ffa0ea9c1c5514e595f98"`,
    );
    await queryRunner.query(`DROP TABLE "dns_settings"`);
    await queryRunner.query(
      `DROP TYPE "public"."dns_settings_transfer_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."dns_settings_dns_status_enum"`,
    );
  }
}
