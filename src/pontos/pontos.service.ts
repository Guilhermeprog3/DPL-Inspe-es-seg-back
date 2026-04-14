import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePontoDto } from './dto/create-ponto.dto';
import { UpdatePontoDto } from './dto/update-ponto.dto';

// ── include padrão reutilizado em todas as queries ────────────────────────────
const PONTO_INCLUDE = {
  equipamentoAtual: true,
} as const;

@Injectable()
export class PontosService {
  constructor(private prisma: PrismaService) {}

  // ── Criar ponto ────────────────────────────────────────────────────────────
  async create(dto: CreatePontoDto) {
    const { equipamentoAtualId, ...rest } = dto;

    // Garante que o QR Code ainda não existe
    const jaExiste = await this.prisma.pontoInstalacao.findUnique({
      where: { qrCode: rest.qrCode },
    });
    if (jaExiste) {
      throw new ConflictException(`QR Code "${rest.qrCode}" já está em uso.`);
    }

    // Se um equipamento for vinculado, verifica se ele já tem ponto
    if (equipamentoAtualId) {
      const eq = await this.prisma.equipamento.findUnique({
        where: { id: equipamentoAtualId },
        include: { pontoInstalacao: true },
      });
      if (!eq) throw new NotFoundException('Equipamento não encontrado.');
      if (eq.pontoInstalacao) {
        throw new ConflictException(
          `Equipamento "${eq.codigo}" já está vinculado ao ponto "${eq.pontoInstalacao.nome}".`,
        );
      }
    }

    return this.prisma.pontoInstalacao.create({
      data: {
        ...rest,
        // Usa "connect" ao invés de passar o ID diretamente — padrão Prisma para relações
        ...(equipamentoAtualId
          ? { equipamentoAtual: { connect: { id: equipamentoAtualId } } }
          : {}),
      },
      include: PONTO_INCLUDE,
    });
  }

  // ── Listar todos os pontos ─────────────────────────────────────────────────
  async findAll() {
    return this.prisma.pontoInstalacao.findMany({
      include: PONTO_INCLUDE,
      orderBy: { nome: 'asc' },
    });
  }

  // ── Buscar por ID ──────────────────────────────────────────────────────────
  async findOne(id: string) {
    const ponto = await this.prisma.pontoInstalacao.findUnique({
      where: { id },
      include: PONTO_INCLUDE,
    });
    if (!ponto) throw new NotFoundException('Ponto de instalação não encontrado.');
    return ponto;
  }

  // ── Buscar por QR Code ─────────────────────────────────────────────────────
  // pontos.service.ts

async findByQrCode(code: string) {
  // 1. Tenta buscar pelo campo qrCode (Ex: 'EXT-001')
  let ponto = await this.prisma.pontoInstalacao.findUnique({
    where: { qrCode: code },
    include: PONTO_INCLUDE,
  });

  // 2. Se não achou e o código tem formato de UUID, tenta buscar pelo ID
  if (!ponto && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(code)) {
    ponto = await this.prisma.pontoInstalacao.findUnique({
      where: { id: code },
      include: PONTO_INCLUDE,
    });
  }

  if (!ponto) throw new NotFoundException('Ponto não encontrado para este QR Code.');
  
  return ponto;
}

  // ── Listar equipamentos DISPONÍVEIS (sem ponto vinculado) ──────────────────
  // Usado pela aba de Vínculo no frontend para exibir apenas equipamentos livres
  async findEquipamentosDisponiveis() {
    return this.prisma.equipamento.findMany({
      where: {
        pontoInstalacao: null, // Apenas equipamentos sem ponto vinculado
      },
      orderBy: { codigo: 'asc' },
    });
  }

  // ── Atualizar ponto ────────────────────────────────────────────────────────
  async update(id: string, dto: UpdatePontoDto) {
    await this.findOne(id); // Lança 404 se não existir

    const { equipamentoAtualId, ...rest } = dto;

    // Se está trocando o equipamento, valida disponibilidade do novo
    if (equipamentoAtualId !== undefined) {
      if (equipamentoAtualId !== null) {
        const eq = await this.prisma.equipamento.findUnique({
          where: { id: equipamentoAtualId },
          include: { pontoInstalacao: true },
        });
        if (!eq) throw new NotFoundException('Equipamento não encontrado.');
        // Permite reutilizar o mesmo equipamento que já está neste ponto
        if (eq.pontoInstalacao && eq.pontoInstalacao.id !== id) {
          throw new ConflictException(
            `Equipamento "${eq.codigo}" já está vinculado ao ponto "${eq.pontoInstalacao.nome}".`,
          );
        }
      }
    }

    return this.prisma.pontoInstalacao.update({
      where: { id },
      data: {
        ...rest,
        ...(equipamentoAtualId === null
          ? { equipamentoAtual: { disconnect: true } }          // Remove vínculo
          : equipamentoAtualId
          ? { equipamentoAtual: { connect: { id: equipamentoAtualId } } } // Troca/vincula
          : {}),                                                // Não mexe no vínculo
      },
      include: PONTO_INCLUDE,
    });
  }

  // ── Remover ponto ──────────────────────────────────────────────────────────
  async remove(id: string) {
    await this.findOne(id); // Lança 404 se não existir
    await this.prisma.pontoInstalacao.delete({ where: { id } });
  }

  // ── Hierarquia para o Dashboard (UF → Regional → Base) ────────────────────
  async getLocationsHierarchy() {
    const pontos = await this.prisma.pontoInstalacao.findMany({
      select: { uf: true, regional: true, base: true },
    });

    return pontos.reduce<Record<string, Record<string, string[]>>>((acc, curr) => {
      if (!acc[curr.uf]) acc[curr.uf] = {};
      if (!acc[curr.uf][curr.regional]) acc[curr.uf][curr.regional] = [];
      if (!acc[curr.uf][curr.regional].includes(curr.base)) {
        acc[curr.uf][curr.regional].push(curr.base);
      }
      return acc;
    }, {});
  }
}