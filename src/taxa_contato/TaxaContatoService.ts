// src/taxa-contato/taxa-contato.service.ts
import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TaxaContatoService {
  private readonly logger = new Logger(TaxaContatoService.name);

  constructor(private prisma: PrismaService) {}

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
        [JUSTIFICATIVA] AS justificativa,
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

  async findAllForAssociation(user: any) {
    const { role } = user;
    const allowedRoles = ['admin', 'gerente', 'coordenador', 'supervisor'];
    if (!allowedRoles.includes(role)) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar estes dados.',
      );
    }

    const mesAtual = await this.getMesAtualBanco();
    if (!mesAtual) return [];

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

  async updateOne(id: number, body: Record<string, any>, user: any) {
    const registroAntigo = await this.prisma.taxaContato.findUnique({ where: { id } });
    if (!registroAntigo) throw new Error('Registro não encontrado');

    const updateData: Prisma.TaxaContatoUpdateInput = {};
    const logs: any[] = [];

    // Campos monitorados para log
    const camposMonitorados = ['chapa', 'nome', 'funcao', 'secao', 'codsituacao', 'justificativa', 'local', 'regional', 'area', 'equipe', 'supervisor', 'base', 'email', 'filial'];

    for (const campo of camposMonitorados) {
      if (body[campo] !== undefined && String(body[campo]) !== String(registroAntigo[campo])) {
        updateData[campo] = body[campo];
        logs.push({
          taxaContatoId: id,
          usuarioNome: `${user.nome} ${user.sobrenome}`,
          usuarioEmail: user.email,
          acao: 'UPDATE',
          campoAlterado: campo.toUpperCase(),
          valorAntigo: String(registroAntigo[campo] || ''),
          valorNovo: String(body[campo] || ''),
        });
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.taxaContato.update({ where: { id }, data: updateData });
      if (logs.length > 0) {
        await (tx as any).taxaContatoLog.createMany({ data: logs });
      }
      return updated;
    });
  }

  async claimCollaborator(id: number, payload: any, user: any) {
    const registro = await this.prisma.taxaContato.findUnique({ where: { id } });
    if (!registro) throw new Error('Registro não encontrado');

    const idAlvo = registro.chapa ? (await this.getIdMesAtual(registro.chapa)) || id : id;

    return this.updateOne(idAlvo, {
      supervisor: payload.supervisorName,
      email: payload.supervisorEmail,
      area: payload.area,
      base: payload.base,
      regional: payload.regional
    }, user);
  }

  async removeFromSupervision(id: number, user: any) {
    const registro = await this.prisma.taxaContato.findUnique({ where: { id } });
    if (!registro) throw new Error('Registro não encontrado');

    const idAlvo = registro.chapa ? (await this.getIdMesAtual(registro.chapa)) || id : id;

    return this.updateOne(idAlvo, { supervisor: null, email: null }, user);
  }

  async createOne(body: Record<string, any>, user: any) {
    const mesAtual = await this.getMesAtualBanco();
    let dataFormatada: string | null = null;
    if (mesAtual) {
      dataFormatada = `${mesAtual.ano}-01-${mesAtual.mes} 00:00:00.000`;
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRawUnsafe(`
        INSERT INTO [Taxa_Contato]
          ([CHAPA],[NOME],[FUNCAO],[SECAO],[CODSITUACAO],[JUSTIFICATIVA],[LOCAL],[REGIONAL],
           [AREA],[EQUIPE],[SUPERVISOR],[BASE],[EMAIL],[FILIAL],[DATA],
           [updatedAt],[createdAt])
        VALUES
          (@P1,@P2,@P3,@P4,@P5,@P6,@P7,@P8,@P9,@P10,@P11,@P12,@P13,@P14,@P15,GETDATE(),GETDATE())
      `, 
      body.chapa || null, body.nome || null, body.funcao || null, body.secao || null, 
      body.codsituacao || null, body.justificativa || null, body.local || null, body.regional || null,
      body.area || null, body.equipe || null, body.supervisor || null, body.base || null, 
      body.email || null, body.filial || null, dataFormatada);

      const inserted: any[] = await tx.$queryRawUnsafe(`SELECT TOP 1 [ID] FROM [Taxa_Contato] ORDER BY [ID] DESC`);
      const newId = inserted[0].ID;

      await (tx as any).taxaContatoLog.create({
        data: {
          taxaContatoId: newId,
          usuarioNome: `${user.nome} ${user.sobrenome}`,
          usuarioEmail: user.email,
          acao: 'CREATE',
          campoAlterado: 'REGISTRO',
          valorAntigo: '',
          valorNovo: `Criado: ${body.nome} (${body.chapa})`
        }
      });

      return { id: newId, ...body };
    });
  }

  async deleteOne(id: number, user: any) {
    const registro = await this.prisma.taxaContato.findUnique({ where: { id } });
    if (!registro) throw new Error('Registro não encontrado');

    return this.prisma.$transaction(async (tx) => {
      await (tx as any).taxaContatoLog.create({
        data: {
          taxaContatoId: id,
          usuarioNome: `${user.nome} ${user.sobrenome}`,
          usuarioEmail: user.email,
          acao: 'DELETE',
          campoAlterado: 'REGISTRO',
          valorAntigo: `Chapa: ${registro.chapa} | Nome: ${registro.nome}`,
          valorNovo: 'EXCLUÍDO'
        }
      });
      return tx.taxaContato.delete({ where: { id } });
    });
  }

  async getStats() {
    return this.prisma.taxaContato.groupBy({
      by: ['regional'],
      _count: { chapa: true },
    });
  }
}