import { Module } from '@nestjs/common';
import { InspecoesService } from './inspecoes.service';
import { InspecoesController } from './inspecoes.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule], // Importa o módulo que provê o PrismaService
  controllers: [InspecoesController],
  providers: [InspecoesService],
  exports: [InspecoesService], // Permite que outros módulos usem o service de inspeções
})
export class InspecoesModule {}