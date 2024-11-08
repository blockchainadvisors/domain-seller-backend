import { MigrationInterface, QueryRunner } from 'typeorm';

export class FullSchmaSetupFix1730998554736 implements MigrationInterface {
  name = 'FullSchmaSetupFix1730998554736';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auction" DROP CONSTRAINT "FK_eade260f03db81f0f2770e07058"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bid" DROP CONSTRAINT "FK_40ae01acfb7a564ead705c3502a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bid" DROP CONSTRAINT "FK_aa471f5e286f6e415b443d0f364"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bid" DROP CONSTRAINT "FK_ca1b5dcc81a6a4147ba80c37263"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment" DROP CONSTRAINT "FK_3dd21505bf38aeefe2e7fe6d404"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment" DROP CONSTRAINT "FK_887dfa15995572f88544d7705dc"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9bd2fe7a8e694dedc4ec2f666f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_58e4dbff0e1a32a9bdc861bb29"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f0e1b4ecdca13b177e2e3a0613"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "socialId"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "firstName"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "lastName"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "deletedAt"`);
    await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "deletedAt"`);
    await queryRunner.query(`ALTER TABLE "domain" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "domain" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "auction" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "auction" DROP COLUMN "updatedAt"`);
    await queryRunner.query(
      `ALTER TABLE "auction" DROP CONSTRAINT "REL_eade260f03db81f0f2770e0705"`,
    );
    await queryRunner.query(`ALTER TABLE "auction" DROP COLUMN "domainIdId"`);
    await queryRunner.query(`ALTER TABLE "bid" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "bid" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "bid" DROP COLUMN "userIdId"`);
    await queryRunner.query(`ALTER TABLE "bid" DROP COLUMN "domainIdId"`);
    await queryRunner.query(`ALTER TABLE "bid" DROP COLUMN "auctionIdId"`);
    await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "userIdId"`);
    await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "bidIdId"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "social_id" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "first_name" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "last_name" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "user" ADD "deleted_at" TIMESTAMP`);
    await queryRunner.query(
      `ALTER TABLE "session" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "session" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "session" ADD "deleted_at" TIMESTAMP`);
    await queryRunner.query(
      `ALTER TABLE "domain" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "domain" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" ADD "domain_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" ADD CONSTRAINT "UQ_881d398e297dca8d2cacf7187b8" UNIQUE ("domain_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "bid" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "bid" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "bid" ADD "user_id" uuid`);
    await queryRunner.query(`ALTER TABLE "bid" ADD "domain_id" uuid`);
    await queryRunner.query(`ALTER TABLE "bid" ADD "auction_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "payment" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "payment" ADD "user_id" uuid`);
    await queryRunner.query(`ALTER TABLE "payment" ADD "bid_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "session" DROP CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "PK_cace4a159ff9f2512dd42373760"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "session" DROP CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11"`,
    );
    await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "session" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "session" ADD CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3d2f174ef04fb312fdebd0ddc5"`,
    );
    await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "userId"`);
    await queryRunner.query(`ALTER TABLE "session" ADD "userId" uuid`);
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
      `CREATE INDEX "IDX_3d2f174ef04fb312fdebd0ddc5" ON "session" ("userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "session" ADD CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
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
      `ALTER TABLE "session" DROP CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3d2f174ef04fb312fdebd0ddc5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6937e802be2946855a3ad0e6be"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7a4fd2a547828e5efe420e50d1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0cd76a8cdee62eeff31d384b73"`,
    );
    await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "userId"`);
    await queryRunner.query(`ALTER TABLE "session" ADD "userId" integer`);
    await queryRunner.query(
      `CREATE INDEX "IDX_3d2f174ef04fb312fdebd0ddc5" ON "session" ("userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "session" DROP CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11"`,
    );
    await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "session" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "session" ADD CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "PK_cace4a159ff9f2512dd42373760"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "session" ADD CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "bid_id"`);
    await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "user_id"`);
    await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "bid" DROP COLUMN "auction_id"`);
    await queryRunner.query(`ALTER TABLE "bid" DROP COLUMN "domain_id"`);
    await queryRunner.query(`ALTER TABLE "bid" DROP COLUMN "user_id"`);
    await queryRunner.query(`ALTER TABLE "bid" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "bid" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "auction" DROP CONSTRAINT "UQ_881d398e297dca8d2cacf7187b8"`,
    );
    await queryRunner.query(`ALTER TABLE "auction" DROP COLUMN "domain_id"`);
    await queryRunner.query(`ALTER TABLE "auction" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "auction" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "domain" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "domain" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "last_name"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "first_name"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "social_id"`);
    await queryRunner.query(`ALTER TABLE "payment" ADD "bidIdId" uuid`);
    await queryRunner.query(`ALTER TABLE "payment" ADD "userIdId" integer`);
    await queryRunner.query(
      `ALTER TABLE "payment" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "bid" ADD "auctionIdId" uuid`);
    await queryRunner.query(`ALTER TABLE "bid" ADD "domainIdId" uuid`);
    await queryRunner.query(`ALTER TABLE "bid" ADD "userIdId" integer`);
    await queryRunner.query(
      `ALTER TABLE "bid" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "bid" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" ADD "domainIdId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" ADD CONSTRAINT "REL_eade260f03db81f0f2770e0705" UNIQUE ("domainIdId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "domain" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "domain" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "session" ADD "deletedAt" TIMESTAMP`);
    await queryRunner.query(
      `ALTER TABLE "session" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "session" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "user" ADD "deletedAt" TIMESTAMP`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "lastName" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "firstName" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "socialId" character varying`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f0e1b4ecdca13b177e2e3a0613" ON "user" ("lastName") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_58e4dbff0e1a32a9bdc861bb29" ON "user" ("firstName") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9bd2fe7a8e694dedc4ec2f666f" ON "user" ("socialId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "payment" ADD CONSTRAINT "FK_887dfa15995572f88544d7705dc" FOREIGN KEY ("bidIdId") REFERENCES "bid"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment" ADD CONSTRAINT "FK_3dd21505bf38aeefe2e7fe6d404" FOREIGN KEY ("userIdId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bid" ADD CONSTRAINT "FK_ca1b5dcc81a6a4147ba80c37263" FOREIGN KEY ("auctionIdId") REFERENCES "auction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bid" ADD CONSTRAINT "FK_aa471f5e286f6e415b443d0f364" FOREIGN KEY ("domainIdId") REFERENCES "domain"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bid" ADD CONSTRAINT "FK_40ae01acfb7a564ead705c3502a" FOREIGN KEY ("userIdId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" ADD CONSTRAINT "FK_eade260f03db81f0f2770e07058" FOREIGN KEY ("domainIdId") REFERENCES "domain"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
