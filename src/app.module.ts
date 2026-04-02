import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // Adicione este import
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MedidasModule } from './medidas/medidas.module';
import { TaxaContatoModule } from './taxa-contato/taxa-contato.module';

@Module({
  imports: [
    // O ConfigModule DEVE vir antes do PrismaModule para carregar as variáveis
    ConfigModule.forRoot({ isGlobal: true }), 
    PrismaModule,
    AuthModule,
    UsersModule,
    MedidasModule,
    TaxaContatoModule
  ],
})
export class AppModule {}