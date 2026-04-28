import { Module } from '@nestjs/common';
import { InspecoesService } from './inspecoes.service';
import { InspecoesController } from './inspecoes.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InspecoesController],
  providers: [InspecoesService],
  exports: [InspecoesService],
})
export class InspecoesModule {}