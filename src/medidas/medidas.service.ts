// src/medidas/medidas.service.ts
import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Client } from 'ssh2';

@Injectable()
export class MedidasService {
  constructor(private prisma: PrismaService) {}

  async create(dto: any, userId: string, files: Express.Multer.File[]) {
    const { files: _, ...dataForPrisma } = dto;

    const medida = await this.prisma.medida.create({
      data: {
        ...dataForPrisma,
        diasSuspensao: dto.diasSuspensao ? parseInt(dto.diasSuspensao) : null,
        criadoPorId: userId,
      },
    });

    if (files && files.length > 0) {
      await this.processFiles(files, medida.id);
    }

    return medida;
  }

  // MÉTODO UPDATE CORRIGIDO
  async update(id: string, dto: any, userId: string, files: Express.Multer.File[]) {
    // 1. Verifica se a medida existe
    const medidaExistente = await this.prisma.medida.findUnique({ where: { id } });

    if (!medidaExistente) throw new NotFoundException('Medida não encontrada');
    
    // 2. Segurança
    if (medidaExistente.criadoPorId !== userId) {
      throw new ForbiddenException('Você só pode editar suas próprias medidas');
    }

    // 3. Limpeza do DTO
    const { files: _, anexos, ...dataForPrisma } = dto;

    // 4. Atualiza os dados de texto
    const medidaAtualizada = await this.prisma.medida.update({
      where: { id },
      data: {
        ...dataForPrisma,
        diasSuspensao: dto.diasSuspensao !== undefined 
          ? (dto.diasSuspensao ? parseInt(dto.diasSuspensao) : null) 
          : undefined,
      },
    });

    // 5. Processa novos arquivos se houver
    if (files && files.length > 0) {
      await this.processFiles(files, id);
    }

    return medidaAtualizada;
  }

  // MÉTODO AUXILIAR PARA EVITAR REPETIÇÃO DE CÓDIGO
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

  async uploadToSFTP(file: Express.Multer.File, remotePath: string): Promise<void> {
    const conn = new Client();
    return new Promise((resolve, reject) => {
      conn.on('ready', () => {
        conn.sftp((err, sftp) => {
          if (err) {
            conn.end();
            return reject(err);
          }
          const writeStream = sftp.createWriteStream(remotePath);
          writeStream.on('close', () => {
            conn.end();
            resolve();
          });
          writeStream.on('error', (streamErr) => {
            conn.end();
            reject(streamErr);
          });
          writeStream.end(file.buffer);
        });
      })
      .on('error', (err) => reject(err))
      .connect({
        host: '10.10.211.6',
        port: 22,
        username: 'user_SIG',
        password: 'kQhfzJBN@¨#*$$189234{712*' 
      });
    });
  }

  // ... (findAllByRegional, findOne, findAllByUser, remove permanecem iguais)
  async findAllByRegional(userId: string, role: string, userUf: string, userRegional: string) {
    const filter: any = {};
    if (role.toLowerCase() !== 'admin') {
      filter.criadoPor = { uf: userUf, regional: userRegional };
    }
    return this.prisma.medida.findMany({
      where: filter,
      include: { anexos: true, criadoPor: { select: { nome: true, uf: true, regional: true } } },
      orderBy: { data: 'desc' },
    });
  }

  async findOne(id: string) {
    const medida = await this.prisma.medida.findUnique({ where: { id }, include: { anexos: true } });
    if (!medida) throw new NotFoundException(`Medida com ID ${id} não encontrada`);
    return medida;
  }

  async findAllByUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { uf: true, regional: true, role: true } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    const filter: any = {};
    if (user.role !== 'admin') {
      filter.criadoPor = { uf: user.uf, regional: user.regional };
    }
    return this.prisma.medida.findMany({
      where: filter,
      include: { anexos: true, criadoPor: { select: { nome: true, uf: true, regional: true } } },
      orderBy: { data: 'desc' },
    });
  }

  async remove(id: string, userId: string) {
    const medida = await this.prisma.medida.findUnique({ where: { id } });
    if (!medida) throw new NotFoundException('Medida não encontrada');
    if (medida.criadoPorId !== userId) throw new ForbiddenException('Você não tem permissão');
    return this.prisma.medida.delete({ where: { id } });
  }

  // Adicione no MedidasService
async findAnexoById(id: string) {
  const anexo = await this.prisma.medidaAnexo.findUnique({
    where: { id },
  });
  if (!anexo) throw new NotFoundException('Anexo não encontrado no banco');
  return anexo;
}

async downloadFromSFTP(remotePath: string): Promise<Buffer> {
  const conn = new Client();
  return new Promise((resolve, reject) => {
    conn.on('ready', () => {
      conn.sftp((err, sftp) => {
        if (err) {
          conn.end();
          return reject(err);
        }

        // Criar um stream de leitura do servidor remoto
        const readStream = sftp.createReadStream(remotePath);
        const chunks: Buffer[] = [];

        readStream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        readStream.on('error', (streamErr) => {
          conn.end();
          reject(streamErr);
        });
        readStream.on('end', () => {
          conn.end();
          resolve(Buffer.concat(chunks));
        });
      });
    })
    .on('error', (err) => reject(err))
    .connect({
      host: '10.10.211.6',
      port: 22,
      username: 'user_SIG',
      password: 'kQhfzJBN@¨#*$$189234{712*' 
    });
  });
}
}