// src/taxa-contato/taxa-contato.service.ts
import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TaxaContatoService {
  private readonly logger = new Logger(TaxaContatoService.name);

  constructor(private prisma: PrismaService) {}

  // ── Retorna o mês mais recente disponível no banco ────────────────────────
  // Banco usa formato YYYY-DD-MM: posição 1-4=ano, 6-7=dia, 9-10=mês
  private async getMesAtualBanco(): Promise<{ ano: string; mes: string } | null> {
    const result = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT TOP 1
        SUBSTRING(CAST([DATA] AS NVARCHAR(MAX)), 1, 4) AS ano,
        SUBSTRING(CAST([DATA] AS NVARCHAR(MAX)), 9, 2) AS mes
      FROM [Taxa_Contato]
      WHERE [DATA] IS NOT NULL
      ORDER BY
        SUBSTRING(CAST([DATA] AS NVARCHAR(MAX)), 1, 4) DESC,
        SUBSTRING(CAST([DATA] AS NVARCHAR(MAX)), 9, 2) DESC
    `);
    if (!result || result.length === 0) return null;
    return { ano: result[0].ano, mes: result[0].mes };
  }

  async findAll(filters: any, user: any) {
    const { role, regional: userRegional, nome, sobrenome } = user;
    const nomeCompleto = `${nome} ${sobrenome}`.toUpperCase();

    let anoFiltro: string | null = null;
    let mesFiltro: string | null = null;

    if (filters.competencia) {
      const parts = String(filters.competencia).split('/');
      if (parts.length === 2) {
        mesFiltro = parts[0].padStart(2, '0');
        anoFiltro = parts[1];
      }
    }

    let regionalFiltro: string | null = null;
    let supervisorFiltro: string | null = null;

    if (role === 'admin') {
      // sem restrição
    } else if (role === 'coordenador' || role === 'gerente') {
      regionalFiltro =
        userRegional === 'METROPOLITANA' ? 'METRO' : userRegional;
    } else if (role === 'supervisor') {
      supervisorFiltro = nomeCompleto;
    } else {
      throw new ForbiddenException(
        'Você não tem permissão para acessar estes dados.',
      );
    }

    const conditions: string[] = ['1=1'];
    const params: any[] = [];

    if (anoFiltro && mesFiltro) {
      params.push(anoFiltro);
      conditions.push(`SUBSTRING(CAST([DATA] AS NVARCHAR(MAX)), 1, 4) = @P${params.length}`);
      params.push(mesFiltro);
      conditions.push(`SUBSTRING(CAST([DATA] AS NVARCHAR(MAX)), 9, 2) = @P${params.length}`);
    }

    if (regionalFiltro) {
      params.push(regionalFiltro);
      conditions.push(`[REGIONAL] = @P${params.length}`);
    }

    if (supervisorFiltro) {
      params.push(supervisorFiltro);
      conditions.push(`[SUPERVISOR] = @P${params.length}`);
    }

    const whereClause = conditions.join(' AND ');
    this.logger.debug(`WHERE: ${whereClause} | params: ${JSON.stringify(params)}`);

    const sql = `
      SELECT
        [ID]          AS id,
        [CHAPA]       AS chapa,
        [NOME]        AS nome,
        [FUNCAO]      AS funcao,
        [SECAO]       AS secao,
        [CODSITUACAO] AS codsituacao,
        [LOCAL]       AS [local],
        [REGIONAL]    AS regional,
        [AREA]        AS area,
        [EQUIPE]      AS equipe,
        [SUPERVISOR]  AS supervisor,
        CAST([DATA] AS NVARCHAR(MAX)) AS data,
        [BASE]        AS base,
        [EMAIL]       AS email,
        [FILIAL]      AS filial,
        [updatedAt],
        [createdAt]
      FROM [Taxa_Contato]
      WHERE ${whereClause}
      ORDER BY [NOME] ASC
    `;

    return this.prisma.$queryRawUnsafe<any[]>(sql, ...params);
  }

  // ── Associar/Desassociar: busca apenas do mês mais recente ───────────────
  async findAllForAssociation(user: any) {
    const { role } = user;
    const allowedRoles = ['admin', 'gerente', 'coordenador', 'supervisor'];
    if (!allowedRoles.includes(role)) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar estes dados.',
      );
    }

    // Descobre o mês mais recente disponível
    const mesAtual = await this.getMesAtualBanco();
    this.logger.debug(`[findAllForAssociation] mês mais recente: ${JSON.stringify(mesAtual)}`);

    if (!mesAtual) {
      return [];
    }

    // Retorna apenas registros do mês mais recente
    const sql = `
      SELECT
        [ID]          AS id,
        [NOME]        AS nome,
        [CHAPA]       AS chapa,
        [FUNCAO]      AS funcao,
        [AREA]        AS area,
        [BASE]        AS base,
        [REGIONAL]    AS regional,
        [FILIAL]      AS filial,
        [SUPERVISOR]  AS supervisor,
        [EMAIL]       AS email,
        [CODSITUACAO] AS codsituacao
      FROM [Taxa_Contato]
      WHERE
        SUBSTRING(CAST([DATA] AS NVARCHAR(MAX)), 1, 4) = @P1
        AND SUBSTRING(CAST([DATA] AS NVARCHAR(MAX)), 9, 2) = @P2
      ORDER BY [NOME] ASC
    `;

    return this.prisma.$queryRawUnsafe<any[]>(sql, mesAtual.ano, mesAtual.mes);
  }

  // ── Atualiza apenas o registro do mês mais recente para o colaborador ────
  // Garante que não altera registros de meses anteriores
  private async getIdMesAtual(chapa: string): Promise<number | null> {
    const mesAtual = await this.getMesAtualBanco();
    if (!mesAtual) return null;

    const result = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT TOP 1 [ID] AS id
      FROM [Taxa_Contato]
      WHERE
        [CHAPA] = @P1
        AND SUBSTRING(CAST([DATA] AS NVARCHAR(MAX)), 1, 4) = @P2
        AND SUBSTRING(CAST([DATA] AS NVARCHAR(MAX)), 9, 2) = @P3
    `, chapa, mesAtual.ano, mesAtual.mes);

    return result.length > 0 ? result[0].id : null;
  }

  // Atualização genérica — apenas campos editáveis pelo usuário
  async updateOne(id: number, body: Record<string, any>) {
    const updateData: Prisma.TaxaContatoUpdateInput = {};

    if (body.chapa       !== undefined) updateData.chapa       = body.chapa;
    if (body.nome        !== undefined) updateData.nome        = body.nome;
    if (body.funcao      !== undefined) updateData.funcao      = body.funcao;
    if (body.secao       !== undefined) updateData.secao       = body.secao;
    if (body.codsituacao !== undefined) updateData.codsituacao = body.codsituacao;
    if (body.local       !== undefined) updateData.local       = body.local;
    if (body.regional    !== undefined) updateData.regional    = body.regional;
    if (body.area        !== undefined) updateData.area        = body.area;
    if (body.equipe      !== undefined) updateData.equipe      = body.equipe;
    if (body.supervisor  !== undefined) updateData.supervisor  = body.supervisor;
    if (body.base        !== undefined) updateData.base        = body.base;
    if (body.email       !== undefined) updateData.email       = body.email;
    if (body.filial      !== undefined) updateData.filial      = body.filial;

    return this.prisma.taxaContato.update({ where: { id }, data: updateData });
  }

  // Associar / transferir — atualiza apenas o registro do mês mais recente
  async claimCollaborator(
    id: number,
    payload: {
      supervisorName: string;
      supervisorEmail: string;
      area?: string;
      base?: string;
      regional?: string;
    },
  ) {
    const updateData: Prisma.TaxaContatoUpdateInput = {
      supervisor: payload.supervisorName,
      email:      payload.supervisorEmail,
    };

    if (payload.area     !== undefined) updateData.area     = payload.area;
    if (payload.base     !== undefined) updateData.base     = payload.base;
    if (payload.regional !== undefined) updateData.regional = payload.regional;

    // Busca a chapa do registro para encontrar o ID do mês mais recente
    const registro = await this.prisma.taxaContato.findUnique({
      where: { id },
      select: { chapa: true },
    });

    if (registro?.chapa) {
      const idMesAtual = await this.getIdMesAtual(registro.chapa);
      if (idMesAtual && idMesAtual !== id) {
        // Atualiza o registro do mês mais recente em vez do passado
        this.logger.debug(`[claimCollaborator] redirecionando id ${id} → ${idMesAtual} (mês mais recente)`);
        return this.prisma.taxaContato.update({ where: { id: idMesAtual }, data: updateData });
      }
    }

    return this.prisma.taxaContato.update({ where: { id }, data: updateData });
  }

  // Liberar supervisor — atualiza apenas o registro do mês mais recente
  async removeFromSupervision(id: number) {
    const registro = await this.prisma.taxaContato.findUnique({
      where: { id },
      select: { chapa: true },
    });

    const updateData: Prisma.TaxaContatoUpdateInput = { supervisor: null, email: null };

    if (registro?.chapa) {
      const idMesAtual = await this.getIdMesAtual(registro.chapa);
      if (idMesAtual && idMesAtual !== id) {
        this.logger.debug(`[removeFromSupervision] redirecionando id ${id} → ${idMesAtual} (mês mais recente)`);
        return this.prisma.taxaContato.update({ where: { id: idMesAtual }, data: updateData });
      }
    }

    return this.prisma.taxaContato.update({ where: { id }, data: updateData });
  }

  // Criar novo registro
  async createOne(body: Record<string, any>) {
    const createData: Prisma.TaxaContatoCreateInput = {
      chapa:       body.chapa       ?? null,
      nome:        body.nome        ?? null,
      funcao:      body.funcao      ?? null,
      secao:       body.secao       ?? null,
      codsituacao: body.codsituacao ?? null,
      local:       body.local       ?? null,
      regional:    body.regional    ?? null,
      area:        body.area        ?? null,
      equipe:      body.equipe      ?? null,
      supervisor:  body.supervisor  ?? null,
      base:        body.base        ?? null,
      email:       body.email       ?? null,
      filial:      body.filial      ?? null,
    };

    return this.prisma.taxaContato.create({ data: createData });
  }

  // Excluir registro
  async deleteOne(id: number) {
    return this.prisma.taxaContato.delete({ where: { id } });
  }

  async getStats() {
    return this.prisma.taxaContato.groupBy({
      by: ['regional'],
      _count: { chapa: true },
    });
  }
}