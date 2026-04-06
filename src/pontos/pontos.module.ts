import { Module } from '@nestjs/common';
import { PontosService } from './pontos.service';
import { PontosController } from './pontos.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PontosController],
  providers: [PontosService],
  exports: [PontosService],
})
export class PontosModule {}