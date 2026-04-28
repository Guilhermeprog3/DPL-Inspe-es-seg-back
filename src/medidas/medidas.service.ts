
import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Client } from 'ssh2';

function parseInspecoes(raw: string | string[] | null | undefined): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(s => String(s).trim()).filter(Boolean);
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String).map(s => s.trim()).filter(Boolean);
  } catch {}
  return raw.trim() ? [raw.trim()] : [];
}

@Injectable()
export class MedidasService {
  constructor(private prisma: PrismaService) {}

  private enrichMedida(medida: any) {
    return {
      ...medida,
      numerosInspecao: parseInspecoes(medida.numerosInspecao ?? medida.numeroInspecao),
    };
  }

  async create(dto: any, userId: string, files: Express.Multer.File[]) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { uf: true, regional: true },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const {
      files: _,
      userId: __,
      uf: _uf,
      regional: _reg,
      numerosInspecao,
      numeroInspecao,
      ...dataForPrisma
    } = dto;

    const inspecoesArray = parseInspecoes(numerosInspecao ?? numeroInspecao);

    const medida = await this.prisma.medida.create({
      data: {
        ...dataForPrisma,
        diasSuspensao: dto.diasSuspensao ? parseInt(dto.diasSuspensao) : null,
        criadoPorId: userId,
        uf: user.uf,
        regional: user.regional,
        numerosInspecao: inspecoesArray.length ? JSON.stringify(inspecoesArray) : null,
        numeroInspecao: null,
      },
    });

    if (files && files.length > 0) {
      await this.processFiles(files, medida.id);
    }

    return this.enrichMedida(medida);
  }

  async update(id: string, dto: any, userId: string, files: Express.Multer.File[]) {
    const medidaExistente = await this.prisma.medida.findUnique({ where: { id } });
    if (!medidaExistente) throw new NotFoundException('Medida não encontrada');
    if (medidaExistente.criadoPorId !== userId) {
      throw new ForbiddenException('Você só pode editar suas próprias medidas');
    }

    const {
      files: _,
      userId: __,
      uf: _uf,
      regional: _reg,
      anexos,
      numerosInspecao,
      numeroInspecao,
      ...dataForPrisma
    } = dto;

    const inspecoesArray = parseInspecoes(numerosInspecao ?? numeroInspecao);

    const medidaAtualizada = await this.prisma.medida.update({
      where: { id },
      data: {
        ...dataForPrisma,
        diasSuspensao: dto.diasSuspensao !== undefined
          ? (dto.diasSuspensao ? parseInt(dto.diasSuspensao) : null)
          : undefined,
        numerosInspecao: inspecoesArray.length ? JSON.stringify(inspecoesArray) : null,
      },
    });

    if (files && files.length > 0) {
      await this.processFiles(files, id);
    }

    return this.enrichMedida(medidaAtualizada);
  }

  private async processFiles(files: Express.Multer.File[], medidaId: string) {
    for (const file of files) {
      const safeName = file.originalname.replace(/\s+/g, '_');
      const uniqueName = `${Date.now()}-${safeName}`;
      const remotePath = `/uploads/medidas/${uniqueName}`;
      try {
        await this.uploadToSFTP(file, remotePath);
        await this.prisma.medidaAnexo.create({
          data: {
            nome: file.originalname,
            url: remotePath,
            tipo: file.mimetype,
            medidaId: medidaId,
          },
        });
      } catch (error) {
        console.error(`Falha no upload SFTP (${file.originalname}):`, error);
      }
    }
  }

  async findAll(
    userId: string,
    role: string,
    userUf: string,
    userRegional: string,
    ufs?: string[],
    regionais?: string[],
  ) {
    const isAdmin = ['admin', 'adm', 'administrador'].includes(role.toLowerCase());

    const where: any = {};

    if (!isAdmin) {
      where.uf       = userUf;
      where.regional = userRegional;
    }

    if (ufs && ufs.length > 0) {
      if (isAdmin) {
        where.uf = { in: ufs };
      } else {
        const ufsFiltradas = ufs.filter(u => u === userUf);
        if (ufsFiltradas.length > 0) where.uf = { in: ufsFiltradas };
      }
    }

    if (regionais && regionais.length > 0) {
      if (isAdmin) {
        where.regional = { in: regionais };
      } else {
        const regionaisFiltradas = regionais.filter(r => r === userRegional);
        if (regionaisFiltradas.length > 0) where.regional = { in: regionaisFiltradas };
      }
    }

    const medidas = await this.prisma.medida.findMany({
      where,
      include: {
        anexos: true,
        criadoPor: { select: { nome: true, uf: true, regional: true } },
      },
      orderBy: { data: 'desc' },
    });

    return medidas.map(m => this.enrichMedida(m));
  }

  async findOne(id: string) {
    const medida = await this.prisma.medida.findUnique({
      where: { id },
      include: { anexos: true },
    });
    if (!medida) throw new NotFoundException(`Medida com ID ${id} não encontrada`);
    return this.enrichMedida(medida);
  }

  async remove(id: string, userId: string) {
    const medida = await this.prisma.medida.findUnique({ where: { id } });
    if (!medida) throw new NotFoundException('Medida não encontrada');
    if (medida.criadoPorId !== userId) throw new ForbiddenException('Você não tem permissão');
    return this.prisma.medida.delete({ where: { id } });
  }

  async findAnexoById(id: string) {
    const anexo = await this.prisma.medidaAnexo.findUnique({ where: { id } });
    if (!anexo) throw new NotFoundException('Anexo não encontrado no banco');
    return anexo;
  }

  async uploadToSFTP(file: Express.Multer.File, remotePath: string): Promise<void> {
    const conn = new Client();
    return new Promise((resolve, reject) => {
      conn
        .on('ready', () => {
          conn.sftp((err, sftp) => {
            if (err) { conn.end(); return reject(err); }
            const writeStream = sftp.createWriteStream(remotePath);
            writeStream.on('close', () => { conn.end(); resolve(); });
            writeStream.on('error', (streamErr) => { conn.end(); reject(streamErr); });
            writeStream.end(file.buffer);
          });
        })
        .on('error', (err) => reject(err))
        .connect({
          host: '10.10.211.6',
          port: 22,
          username: 'user_SIG',
          password: 'kQhfzJBN@¨#*$$189234{712*',
        });
    });
  }

  async downloadFromSFTP(remotePath: string): Promise<Buffer> {
    const conn = new Client();
    return new Promise((resolve, reject) => {
      conn
        .on('ready', () => {
          conn.sftp((err, sftp) => {
            if (err) { conn.end(); return reject(err); }
            const readStream = sftp.createReadStream(remotePath);
            const chunks: Buffer[] = [];
            readStream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
            readStream.on('error', (streamErr) => { conn.end(); reject(streamErr); });
            readStream.on('end', () => { conn.end(); resolve(Buffer.concat(chunks)); });
          });
        })
        .on('error', (err) => reject(err))
        .connect({
          host: '10.10.211.6',
          port: 22,
          username: 'user_SIG',
          password: 'kQhfzJBN@¨#*$$189234{712*',
        });
    });
  }
}