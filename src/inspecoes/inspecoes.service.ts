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

    // Validação do Ponto
    if (!ponto) {
      throw new NotFoundException('Ponto de instalação não encontrado.');
    }

    // EXTRAÇÃO PARA CONSTANTE: Resolve o erro 'ponto.equipamentoAtual is possibly null'
    // Ao validar a constante, o TS garante que ela não é nula dentro da transação.
    const equipamento = ponto.equipamentoAtual;

    if (!equipamento) {
      throw new BadRequestException(
        'Não é possível realizar uma inspeção num ponto sem um equipamento vinculado.',
      );
    }

    // Inicia a transação para garantir que a inspeção e a atualização do status ocorram juntas
    return this.prisma.$transaction(async (tx) => {
      
      // 2. Criar o registo da Inspeção
      const inspecao = await tx.inspecao.create({
        data: {
          status: data.status, // Ex: 'APROVADO', 'REPROVADO', 'ATENCAO'
          respostas: JSON.stringify(data.respostas),
          uf: ponto.uf,
          regional: ponto.regional,
          base: ponto.base,
          localNome: ponto.nome,
          pontoId: ponto.id,
          equipamentoId: equipamento.id, // Utiliza a constante validada
          inspetorId: userId,
        },
      });

      // 3. Atualizar o Status do Equipamento baseado no resultado da inspeção
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

      // 4. Se houver Ação Corretiva (Medida), cria automaticamente
      if (data.acaoCorretiva) {
        await tx.medida.create({
          data: {
            tipo: 'CORRETIVA',
            ocorrencia: `Não conformidade detetada na inspeção ${inspecao.id}`,
            medida: data.acaoCorretiva.descricao,
            // Converte a string de data vinda do front para objeto Date
            data: data.acaoCorretiva.prazo ? new Date(data.acaoCorretiva.prazo) : new Date(),
            colaborador: equipamento.codigo,
            matricula: 'SISTEMA',
            supervisor: 'A DEFINIR',
            gravidade: 'ALTA',
            classificacao: 'SEGURANÇA PCI',
            status: 'EM ANDAMENTO',
            criadoPorId: userId,
            numeroInspecao: inspecao.id,
            nomeSupervisor: 'A DEFINIR',
          },
        });
      }

      return inspecao;
    });
  }

  /**
   * Retorna todas as inspeções para o Dashboard
   */
  async listarTodas() {
    return this.prisma.inspecao.findMany({
      include: {
        inspetor: { select: { nome: true, sobrenome: true } },
        equipamento: { select: { codigo: true, tipo: true } },
        ponto: true,
      },
      orderBy: { data: 'desc' },
    });
  }

  /**
   * Retorna o histórico de inspeções de um local específico
   */
  async buscarHistoricoPorPonto(pontoId: string) {
    return this.prisma.inspecao.findMany({
      where: { pontoId },
      include: {
        inspetor: { select: { nome: true, sobrenome: true } },
        equipamento: true,
      },
      orderBy: { data: 'desc' },
    });
  }
}