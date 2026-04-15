// src/medidas/medidas.service.ts
import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Client } from 'ssh2';

@Injectable()
export class MedidasService {
  constructor(private prisma: PrismaService) {}

  async create(dto: any, userId: string, files: Express.Multer.File[]) {
  // 1. Cria a Medida no Banco
  const medida = await this.prisma.medida.create({
    data: {
      ...dto,
      criadoPorId: userId,
    },
  });

  // 2. Processamento de Arquivos SFTP
  if (files && files.length > 0) {
    for (const file of files) {
      // Gerar nome único e limpar espaços/caracteres especiais
      const safeName = file.originalname.replace(/\s+/g, '_');
      const uniqueName = `${Date.now()}-${safeName}`;
      
      // CAMINHO CORRIGIDO: Aponta diretamente para a pasta /uploads
      const remotePath = `/uploads/medidas/${uniqueName}`;

      try {
        await this.uploadToSFTP(file, remotePath);

        // Salva a referência do anexo no banco vinculado à medida
        await this.prisma.medidaAnexo.create({
          data: {
            nome: file.originalname,
            url: remotePath, // Caminho para consulta futura
            tipo: file.mimetype,
            medidaId: medida.id,
          },
        });
      } catch (error) {
        console.error(`Falha no upload SFTP (${file.originalname}):`, error);
        // Opcional: Você pode lançar um erro aqui se o anexo for obrigatório
      }
    }
  }

  return medida;
}

  // Seu método uploadToSFTP corrigido
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

  async update(id: string, dto: any, userId: string) {
    const medida = await this.prisma.medida.findUnique({ where: { id } });

    if (!medida) throw new NotFoundException('Medida não encontrada');
    if (medida.criadoPorId !== userId) {
      throw new ForbiddenException('Você só pode editar suas próprias medidas');
    }

    return this.prisma.medida.update({
      where: { id },
      data: dto,
    });
  }

  async findOne(id: string) {
    const medida = await this.prisma.medida.findUnique({
      where: { id },
    });

    if (!medida) {
      throw new NotFoundException(`Medida com ID ${id} não encontrada`);
    }

    return medida;
  }

  async findAllByUser(userId: string) {
  return this.prisma.medida.findMany({
    where: { criadoPorId: userId },
    include: {
      anexos: true, // Se o nome da relação no seu schema Prisma for 'anexos'
    },
    orderBy: {
      data: 'desc',
    },
  });
}

  async remove(id: string, userId: string) {
    // 1. Verifica se a medida existe
    const medida = await this.prisma.medida.findUnique({
      where: { id },
    });

    if (!medida) {
      throw new NotFoundException('Medida não encontrada');
    }

    // 2. Segurança: Verifica se o registro pertence ao usuário logado
    if (medida.criadoPorId !== userId) {
      throw new ForbiddenException('Você não tem permissão para excluir esta medida');
    }

    // 3. Deleta de fato
    return this.prisma.medida.delete({
      where: { id },
    });
  }
}