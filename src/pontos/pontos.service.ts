import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePontoDto } from './dto/create-ponto.dto';

@Injectable()
export class PontosService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreatePontoDto) {
    return this.prisma.pontoInstalacao.create({ data });
  }

  async findAll() {
    return this.prisma.pontoInstalacao.findMany({
      include: { equipamentoAtual: true }
    });
  }

  async findByQrCode(qrCode: string) {
    const ponto = await this.prisma.pontoInstalacao.findUnique({
      where: { qrCode },
      include: { equipamentoAtual: true }
    });

    if (!ponto) {
      throw new NotFoundException('Ponto de instalação não encontrado para este QR Code.');
    }
    return ponto;
  }

  // Filtros para o Dashboard (Estado -> Regional -> Base)
  async getLocationsHierarchy() {
    return this.prisma.pontoInstalacao.findMany({
      select: { uf: true, regional: true, base: true, nome: true }
    });
  }
}