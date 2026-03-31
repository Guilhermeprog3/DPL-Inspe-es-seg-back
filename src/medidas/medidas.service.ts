// src/medidas/medidas.service.ts
import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMedidaDto } from './dto/create-medida.dto';

@Injectable()
export class MedidasService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMedidaDto, userId: string) {
    return this.prisma.medida.create({
      data: {
        ...dto,
        criadoPorId: userId,
      },
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.medida.findMany({
      where: { criadoPorId: userId },
      orderBy: { data: 'desc' }
    });
  }

  async update(id: string, dto: any, userId: string) {
    const medida = await this.prisma.medida.findUnique({ where: { id } });

    if (!medida) throw new NotFoundException('Medida não encontrada');
    if (medida.criadoPorId !== userId) {
      throw new ForbiddenException('Você só pode editar suas próprias medidas');
    }

    return this.prisma.medida.update({
      where: { id },
      data: dto,
    });
  }
}