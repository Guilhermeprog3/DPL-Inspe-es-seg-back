import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Isso torna o PrismaService disponível em todo o projeto sem precisar importar em cada módulo
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // ESSENCIAL: Permite que outros módulos usem o service
})
export class PrismaModule {}