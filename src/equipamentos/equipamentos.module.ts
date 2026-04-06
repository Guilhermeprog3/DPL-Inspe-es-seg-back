import { Module } from '@nestjs/common';
import { EquipamentosService } from './equipamentos.service';
import { EquipamentosController } from './equipamentos.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EquipamentosController],
  providers: [EquipamentosService],
  exports: [EquipamentosService],
})
export class EquipamentosModule {}