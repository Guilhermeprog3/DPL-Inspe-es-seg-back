// 1. PRIMEIRA COISA: Carregar as variáveis de ambiente
import * as dotenv from 'dotenv';
dotenv.config(); 

// 2. DEPOIS: Importar o Nest e o AppModule
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('>>> Iniciando NestJS...');
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'https://dpl-sig.vercel.app', // Sua URL da Vercel
      'http://localhost:3000'        // Para você continuar testando localmente
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  await app.listen(3001);
  console.log('🚀 Servidor rodando na porta 3001');
}

bootstrap();