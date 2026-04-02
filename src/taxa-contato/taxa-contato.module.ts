import { Module } from '@nestjs/common';
import { TaxaContatoService } from './taxa-contato.service';
import { TaxaContatoController } from './taxa-contato.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TaxaContatoController],
  providers: [TaxaContatoService],
})
export class TaxaContatoModule {}