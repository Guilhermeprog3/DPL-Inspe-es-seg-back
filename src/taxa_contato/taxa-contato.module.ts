// src/taxa-contato/taxa-contato.module.ts
import { Module } from '@nestjs/common';
import { TaxaContatoService } from './TaxaContatoService';
import { TaxaContatoController } from './taxa-contato.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TaxaContatoController],
  providers: [TaxaContatoService],
  exports: [TaxaContatoService],
})
export class TaxaContatoModule {}