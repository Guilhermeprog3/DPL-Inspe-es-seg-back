import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEquipamentoDto } from './dto/create-equipamento.dto';

@Injectable()
export class EquipamentosService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateEquipamentoDto) {
    const exists = await this.prisma.equipamento.findUnique({
      where: { codigo: data.codigo },
    });
    if (exists) {
      throw new ConflictException(
        'Já existe um equipamento com este código/patrimônio.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const equipamento = await tx.equipamento.create({
        data: {
          codigo: data.codigo,
          tipo:   data.tipo,
          status: data.status,
          uf:     data.uf,
          nome:   data.nome ?? null,

          extintorClasse:  data.extintorClasse  ?? null,
          extintorCarga:   data.extintorCarga ? parseFloat(data.extintorCarga) : null,
          agente:          data.agente          ?? null,
          serieInmetro:    data.serieInmetro    ?? null,
          serieCilindro:   data.serieCilindro   ?? null,
          proximaRecarga:  data.proximaRecarga  ? new Date(data.proximaRecarga)  : null,

          fabricante:      data.fabricante      ?? null,
          modelo:          data.modelo          ?? null,
          capacidade:      data.capacidade      ?? null,
          dataFabricacao:  data.dataFabricacao  ? new Date(data.dataFabricacao)  : null,
          ultimaRecarga:   data.ultimaRecarga   ? new Date(data.ultimaRecarga)   : null,
          ultimaInspecao:  data.ultimaInspecao  ? new Date(data.ultimaInspecao)  : null,
          proximaInspecao: data.proximaInspecao ? new Date(data.proximaInspecao) : null,
        },
      });

      if (data.pontoId) {
        await tx.pontoInstalacao.update({
          where: { id: data.pontoId },
          data:  { equipamentoAtualId: equipamento.id },
        });
      }

      return equipamento;
    });
  }

  async findAll() {
    return this.prisma.equipamento.findMany({
      include: { pontoInstalacao: true },
      orderBy: { tipo: 'asc' },
    });
  }

  /**
   * Retorna apenas equipamentos que ainda não estão vinculados a nenhum
   * PontoInstalacao. Usado pela aba de Vínculo no cadastro de locais.
   *
   * A condição `pontoInstalacao: null` funciona porque o Prisma trata a
   * relação inversa 1-to-1: se nenhum PontoInstalacao aponta para este
   * equipamento via equipamentoAtualId, o join retorna null.
   */
  async findDisponiveis() {
    return this.prisma.equipamento.findMany({
      where: {
        pontoInstalacao: null,
      },
      orderBy: { codigo: 'asc' },
    });
  }

  async findOne(id: string) {
    const equip = await this.prisma.equipamento.findUnique({
      where: { id },
      include: {
        pontoInstalacao: true,
        inspecoes: {
          orderBy: { data: 'desc' },
          take: 10,
        },
      },
    });
    if (!equip) throw new NotFoundException('Equipamento não encontrado.');
    return equip;
  }

  async remove(id: string) {
    await this.prisma.pontoInstalacao.updateMany({
      where: { equipamentoAtualId: id },
      data:  { equipamentoAtualId: null },
    });
    return this.prisma.equipamento.delete({ where: { id } });
  }
}