import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MedidasModule } from './medidas/medidas.module';
import { BaseGenteModule } from './Base_Gente/base-gente.module';
import { EquipamentosModule } from './equipamentos/equipamentos.module';
import { PontosModule } from './pontos/pontos.module';
import { InspecoesModule } from './inspecoes/inspecoes.module';
import { TaxaContatoModule } from './taxa_contato/taxa-contato.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 
    PrismaModule,
    AuthModule,
    UsersModule,
    MedidasModule,
    BaseGenteModule,
    EquipamentosModule,
    PontosModule,
    InspecoesModule,
    TaxaContatoModule
  ],
})
export class AppModule {}