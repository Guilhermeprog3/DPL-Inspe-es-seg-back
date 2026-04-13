import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InspecoesService {
  constructor(private prisma: PrismaService) {}

  async registrarInspecao(userId: string, data: any) {
    // 1. Busca o ponto e inclui o equipamento para validação
    const ponto = await this.prisma.pontoInstalacao.findUnique({
      where: { id: data.pontoId },
      include: { equipamentoAtual: true },
    });

    if (!ponto) {
      throw new NotFoundException('Ponto de instalação não encontrado.');
    }

    const equipamento = ponto.equipamentoAtual;

    if (!equipamento) {
      throw new BadRequestException(
        'Não é possível realizar uma inspeção num ponto sem um equipamento vinculado.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      
      // 2. Criar o registro da Inspeção
      const inspecao = await tx.inspecao.create({
        data: {
          status: data.status,
          respostas: JSON.stringify(data.respostas),
          uf: ponto.uf,
          regional: ponto.regional,
          base: ponto.base,
          localNome: ponto.nome,
          pontoId: ponto.id,
          equipamentoId: equipamento.id,
          inspetorId: userId,
        },
      });

      // 3. Atualizar o Status do Equipamento
      let novoStatusEquipamento = equipamento.status;

      if (data.status === 'REPROVADO' || data.status === 'CANCELADA') {
        novoStatusEquipamento = 'manutencao';
      } else if (data.status === 'APROVADO') {
        novoStatusEquipamento = 'ativo';
      }

      await tx.equipamento.update({
        where: { id: equipamento.id },
        data: { status: novoStatusEquipamento },
      });

      // 4. Processar Múltiplas AÇÕES (Independente de Medida)
      // data.acoesCorretivas vem do seu componente de abas do front
      if (data.acoesCorretivas && Array.isArray(data.acoesCorretivas)) {
        await tx.acaoCorretiva.createMany({
          data: data.acoesCorretivas.map((acao) => ({
            inspecaoId: inspecao.id,
            status: 'A ATRIBUIR', // Forçado conforme solicitado
            dataVencimento: acao.dataVencimento ? new Date(acao.dataVencimento) : null,
            titulo: acao.titulo,
            descricao: acao.descricao,
            numNC: acao.numNC || null,
            empresaResponsavel: acao.empresaResponsavel || 'DPL',
            nomeResponsavel: 'A ATRIBUIR',
            emailsCopia: acao.emailsCopia || null,
          })),
        });
      }

      return inspecao;
    });
  }

  async listarTodas() {
    return this.prisma.inspecao.findMany({
      include: {
        inspetor: { select: { nome: true, sobrenome: true } },
        equipamento: { select: { codigo: true, tipo: true } },
        ponto: true,
        acoesCorretivas: true, // Traz as ações vinculadas
      },
      orderBy: { data: 'desc' },
    });
  }

  async buscarHistoricoPorPonto(pontoId: string) {
    return this.prisma.inspecao.findMany({
      where: { pontoId },
      include: {
        inspetor: { select: { nome: true, sobrenome: true } },
        equipamento: true,
        acoesCorretivas: true,
      },
      orderBy: { data: 'desc' },
    });
  }
}