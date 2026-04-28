import { Module } from '@nestjs/common';
import { BaseGenteService } from './base-gente.service';
import { BaseGenteController } from './base-gente.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BaseGenteController],
  providers: [BaseGenteService],
})
export class BaseGenteModule {}