import { MigrationInterface, QueryRunner } from 'typeorm';

export class FullSchema1733852534623 implements MigrationInterface {
  name = 'FullSchema1733852534623';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "role" ("id" integer NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "status" ("id" integer NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_e12743a7086ec826733f54e1d95" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying, "password" character varying, "provider" character varying NOT NULL DEFAULT 'email', "social_id" character varying, "first_name" character varying, "last_name" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "roleId" integer, "statusId" integer, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0cd76a8cdee62eeff31d384b73" ON "user" ("social_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7a4fd2a547828e5efe420e50d1" ON "user" ("first_name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6937e802be2946855a3ad0e6be" ON "user" ("last_name") `,
    );
    await queryRunner.query(
      `CREATE TABLE "domain" ("current_highest_bid" numeric(18,2), "status" character varying NOT NULL, "category" character varying, "description" character varying, "url" character varying NOT NULL, "registration_date" TIMESTAMP, "renewal_price" numeric(18,2), "current_owner" character varying, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_27e3ec3ea0ae02c8c5bceab3ba9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "auction" ("min_increment" numeric(18,2) NOT NULL, "reserve_price" numeric(18,2) NOT NULL, "lease_price" numeric(18,2) NOT NULL, "expiry_duration" numeric(18,2) NOT NULL, "min_price" numeric(18,2) NOT NULL, "end_time" TIMESTAMP NOT NULL, "start_time" TIMESTAMP NOT NULL, "status" character varying NOT NULL, "current_winner" character varying, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "domain_id" uuid NOT NULL, CONSTRAINT "REL_881d398e297dca8d2cacf7187b" UNIQUE ("domain_id"), CONSTRAINT "PK_9dc876c629273e71646cf6dfa67" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "bid" ("amount" numeric(18) NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, "domain_id" uuid, "auction_id" uuid, CONSTRAINT "PK_ed405dda320051aca2dcb1a50bb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "payment" ("status" character varying NOT NULL, "stripe_id" character varying, "amount" numeric(18,2) NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, "bid_id" uuid, CONSTRAINT "PK_fcaec7df5adf9cac408c686b2ab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "session" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "hash" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "userId" uuid, CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3d2f174ef04fb312fdebd0ddc5" ON "session" ("userId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "file" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "path" character varying NOT NULL, CONSTRAINT "PK_36b46d232307066b3a2c9ea3a1d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "settings" ("description" character varying, "value" character varying NOT NULL, "key" character varying NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0669fe20e252eb692bf4d344975" PRIMARY KEY ("id"))`,
    );
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
      `CREATE TABLE "notification" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_c28e52f758e7bbc53828db92194" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_dc18daa696860586ba4667a9d31" FOREIGN KEY ("statusId") REFERENCES "status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" ADD CONSTRAINT "FK_881d398e297dca8d2cacf7187b8" FOREIGN KEY ("domain_id") REFERENCES "domain"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bid" ADD CONSTRAINT "FK_2abdf07c084ae99935e6506d06e" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bid" ADD CONSTRAINT "FK_ad859976fd6c6f7efe3c7da7556" FOREIGN KEY ("domain_id") REFERENCES "domain"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bid" ADD CONSTRAINT "FK_9e594e5a61c0f3cb25679f6ba8d" FOREIGN KEY ("auction_id") REFERENCES "auction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment" ADD CONSTRAINT "FK_c66c60a17b56ec882fcd8ec770b" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment" ADD CONSTRAINT "FK_421b665aced96fba7cc411d5fd6" FOREIGN KEY ("bid_id") REFERENCES "bid"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "session" ADD CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
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
    await queryRunner.query(
      `ALTER TABLE "session" DROP CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment" DROP CONSTRAINT "FK_421b665aced96fba7cc411d5fd6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment" DROP CONSTRAINT "FK_c66c60a17b56ec882fcd8ec770b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bid" DROP CONSTRAINT "FK_9e594e5a61c0f3cb25679f6ba8d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bid" DROP CONSTRAINT "FK_ad859976fd6c6f7efe3c7da7556"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bid" DROP CONSTRAINT "FK_2abdf07c084ae99935e6506d06e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" DROP CONSTRAINT "FK_881d398e297dca8d2cacf7187b8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_dc18daa696860586ba4667a9d31"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_c28e52f758e7bbc53828db92194"`,
    );
    await queryRunner.query(`DROP TABLE "notification"`);
    await queryRunner.query(`DROP TABLE "dns_settings"`);
    await queryRunner.query(
      `DROP TYPE "public"."dns_settings_transfer_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."dns_settings_dns_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "settings"`);
    await queryRunner.query(`DROP TABLE "file"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3d2f174ef04fb312fdebd0ddc5"`,
    );
    await queryRunner.query(`DROP TABLE "session"`);
    await queryRunner.query(`DROP TABLE "payment"`);
    await queryRunner.query(`DROP TABLE "bid"`);
    await queryRunner.query(`DROP TABLE "auction"`);
    await queryRunner.query(`DROP TABLE "domain"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6937e802be2946855a3ad0e6be"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7a4fd2a547828e5efe420e50d1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0cd76a8cdee62eeff31d384b73"`,
    );
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "status"`);
    await queryRunner.query(`DROP TABLE "role"`);
  }
}
