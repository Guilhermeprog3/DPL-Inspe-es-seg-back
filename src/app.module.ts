import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // Adicione este import
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MedidasModule } from './medidas/medidas.module';
import { TaxaContatoModule } from './taxa-contato/taxa-contato.module';
import { EquipamentosModule } from './equipamentos/equipamentos.module';
import { PontosModule } from './pontos/pontos.module';
import { InspecoesModule } from './inspecoes/inspecoes.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 
    PrismaModule,
    AuthModule,
    UsersModule,
    MedidasModule,
    TaxaContatoModule,
    EquipamentosModule,
    PontosModule,
    InspecoesModule
  ],
})
export class AppModule {}