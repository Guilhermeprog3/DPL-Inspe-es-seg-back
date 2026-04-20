import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient as PrismaClientPFUNC } from '@prisma/client-pfunc';

@Injectable()
export class PrismaPfuncService extends PrismaClientPFUNC implements OnModuleInit {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL_PFUNC,
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }
}