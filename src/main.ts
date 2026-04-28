import * as dotenv from 'dotenv';
dotenv.config(); 

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('>>> Iniciando NestJS...');
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'https://dpl-sig.vercel.app',
      'http://localhost:3000',
      'http://http://10.10.211.5/:3000'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  await app.listen(3001);
  console.log('🚀 Servidor rodando na porta 3001');
}

bootstrap();