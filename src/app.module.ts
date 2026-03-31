import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MedidasModule } from './medidas/medidas.module';

@Module({
  imports: [
    PrismaModule,   // Compartilha a conexão com o banco
    AuthModule,     // Lida com Login/JWT
    UsersModule,    // Módulo de Usuários
    MedidasModule,  // Módulo de Medidas Administrativas que você acabou de criar
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}