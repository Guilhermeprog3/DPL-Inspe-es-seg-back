import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaPfuncService } from './prisma-pfunc.service';

@Global() // Isso torna o PrismaService disponível em todo o projeto sem precisar importar em cada módulo
@Module({
  providers: [PrismaService, PrismaPfuncService], // Adicione aqui
  exports: [PrismaService, PrismaPfuncService], // ESSENCIAL: Permite que outros módulos usem o service
})
export class PrismaModule {}