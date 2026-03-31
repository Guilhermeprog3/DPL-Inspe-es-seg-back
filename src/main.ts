// 1. PRIMEIRA COISA: Carregar as variáveis de ambiente
import * as dotenv from 'dotenv';
dotenv.config(); 

// 2. DEPOIS: Importar o Nest e o AppModule
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('>>> Iniciando NestJS...');
  const app = await NestFactory.create(AppModule);
  await app.listen(3001);
  console.log('🚀 Servidor rodando na porta 3001');
}

bootstrap();