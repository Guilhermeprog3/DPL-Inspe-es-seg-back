import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    console.log('>>> 1. Iniciando conexão (Prisma v5)...');
    try {
      await this.$connect();
      console.log('>>> 2. ✅ Conectado com sucesso!');
    } catch (error) {
      console.error('>>> 3. ❌ Erro de conexão:', error.message);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}