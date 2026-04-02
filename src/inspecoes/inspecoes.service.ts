import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InspecoesService {
  constructor(private prisma: PrismaService) {}

  async registrarInspecao(userId: string, data: any) {
    // Busca o ponto para garantir que os dados de UF/Regional/Base sejam gravados na inspeção
    const ponto = await this.prisma.pontoInstalacao.findUnique({
      where: { id: data.pontoId }
    });

    return this.prisma.inspecao.create({
      data: {
        status: data.status,
        respostas: JSON.stringify(data.respostas),
        uf: ponto.uf,
        regional: ponto.regional,
        base: ponto.base,
        localNome: ponto.nome,
        pontoId: ponto.id,
        equipamentoId: data.equipamentoId,
        inspetorId: userId,
      }
    });
  }
}