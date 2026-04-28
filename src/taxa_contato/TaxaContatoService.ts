// src/taxa-contato/taxa-contato.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TaxaContatoService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: any) {
    return this.prisma.taxaContato.findMany({
      where: filters,
      orderBy: { nome: 'asc' },
    });
  }

  async claimCollaborator(id: number, supervisorName: string, supervisorEmail: string) {
    return this.prisma.taxaContato.update({
      where: { id }, // Usa o novo campo ID IDENTITY
      data: {
        supervisor: supervisorName,
        email: supervisorEmail,
      },
    });
  }

  async removeFromSupervision(id: number) {
    return this.prisma.taxaContato.update({
      where: { id },
      data: {
        supervisor: null,
        email: null,
      },
    });
  }

  async getStats() {
    return this.prisma.taxaContato.groupBy({
      by: ['regional'],
      _count: { chapa: true },
    });
  }
}