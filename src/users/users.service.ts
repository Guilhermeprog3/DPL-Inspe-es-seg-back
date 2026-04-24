// src/users/users.service.ts
import {
  Injectable,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  private readonly regionaisPermitidas: Record<string, string[]> = {
    PI: ['NORTE', 'SUL', 'METROPOLITANA'],
    MA: ['NORTE', 'SUL', 'NORDESTE', 'LESTE'],
  };

  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
  try {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }
    
    return user;
  } catch (err) {
    if (err instanceof NotFoundException) throw err;
    this.logger.error(`Erro ao buscar usuário ID: ${id}`, err);
    throw new InternalServerErrorException('Erro ao buscar usuário.');
  }
}

  async create(createUserDto: CreateUserDto) {
    const { nome, sobrenome, email, password, uf, regional, role } = createUserDto;

    // Valida UF
    const ufUpper = uf?.toUpperCase();
    if (!this.regionaisPermitidas[ufUpper]) {
      throw new BadRequestException(`UF inválida: "${uf}". Permitidas: ${Object.keys(this.regionaisPermitidas).join(', ')}.`);
    }

    // Valida Regional para a UF
    const regionalUpper = regional?.toUpperCase();
    const regionaisValidas = this.regionaisPermitidas[ufUpper];
    if (!regionaisValidas.includes(regionalUpper)) {
      throw new BadRequestException(
        `Regional "${regional}" inválida para ${ufUpper}. Válidas: ${regionaisValidas.join(', ')}.`,
      );
    }

    // Verifica e-mail duplicado explicitamente antes de tentar inserir
    // (evita depender somente do erro do banco)
    const existente = await this.prisma.user.findUnique({ where: { email } });
    if (existente) {
      throw new ConflictException('Este e-mail já está cadastrado. Tente outro ou faça login.');
    }

    // Hash da senha
    let hashedPassword: string;
    try {
      hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
      this.logger.error('Erro ao gerar hash da senha', err);
      throw new InternalServerErrorException('Erro interno ao processar a senha.');
    }

    // Criação no banco
    try {
      const user = await this.prisma.user.create({
        data: {
          nome:     nome.trim(),
          sobrenome: sobrenome.trim(),
          email:    email.toLowerCase().trim(),
          password: hashedPassword,
          uf:       ufUpper,
          regional: regionalUpper,
          role,
          ativo:    false, // pendente de aprovação
        },
        select: {
          id:        true,
          nome:      true,
          sobrenome: true,
          email:     true,
          role:      true,
          uf:        true,
          regional:  true,
          ativo:     true,
          criadoEm: true,
        },
      });

      return {
        message: 'Solicitação de acesso registrada com sucesso. Aguarde aprovação de um administrador.',
        user,
      };
    } catch (err) {
      // Unique constraint do Prisma (P2002) — fallback caso a verificação acima tenha race condition
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('Este e-mail já está cadastrado. Tente outro ou faça login.');
      }

      // Erro de conexão / timeout com o banco
      if (err instanceof Prisma.PrismaClientInitializationError) {
        this.logger.error('Falha de conexão com o banco de dados', err);
        throw new InternalServerErrorException('Não foi possível conectar ao banco de dados. Tente novamente em instantes.');
      }

      if (err instanceof Prisma.PrismaClientRustPanicError) {
        this.logger.error('Erro crítico no Prisma Client', err);
        throw new InternalServerErrorException('Erro interno crítico. Contate o suporte.');
      }

      this.logger.error('Erro inesperado ao criar usuário', err);
      throw new InternalServerErrorException('Erro inesperado ao registrar o usuário. Tente novamente.');
    }
  }

  async update(id: string, data: any) {
  try {
    // 1. Verificar se o usuário existe antes de atualizar
    const userExists = await this.prisma.user.findUnique({ where: { id } });
    if (!userExists) throw new NotFoundException('Usuário não encontrado');

    // 2. Preparar os dados para o Prisma
    // Espalhamos o 'data' para permitir editar nome, email, etc.
    // E tratamos o campo 'ativo' especificamente para garantir que seja Boolean.
    const updatePayload: Prisma.UserUpdateInput = {
      ...data,
    };

    // Tratamento especial para o status ativo
    // Se vier 'ativo' do checkbox (boolean) ou se vier um campo 'status' (string)
    if (data.ativo !== undefined) {
      updatePayload.ativo = Boolean(data.ativo);
    } else if (data.status !== undefined) {
      updatePayload.ativo = data.status === 'ativo';
    }

    // Removemos o campo 'status' do payload se ele existir, pois não existe no Model do Prisma
    if ('status' in updatePayload) {
      delete (updatePayload as any).status;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updatePayload,
      select: {
        id: true,
        nome: true,
        sobrenome: true,
        email: true,
        role: true,
        uf: true,
        regional: true,
        ativo: true,
      },
    });

    return updatedUser;
  } catch (err) {
    if (err instanceof NotFoundException) throw err;
    this.logger.error(`Erro ao atualizar usuário ID: ${id}`, err);
    throw new InternalServerErrorException('Não foi possível atualizar o usuário no banco de dados.');
  }
}

  async findAll() {
    try {
      return await this.prisma.user.findMany({
        select: {
          id:        true,
          nome:      true,
          sobrenome: true,
          email:     true,
          role:      true,
          uf:        true,
          regional:  true,
          ativo:     true,
          criadoEm: true,
        },
        orderBy: { criadoEm: 'desc' },
      });
    } catch (err) {
      this.logger.error('Erro ao buscar usuários', err);
      throw new InternalServerErrorException('Erro ao buscar usuários.');
    }
  }

  async remove(id: string) {
  try {
    // 1. Verificar se o usuário existe antes de deletar
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }

    // 2. Deletar do banco
    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'Usuário removido com sucesso' };
  } catch (err) {
    if (err instanceof NotFoundException) throw err;
    
    this.logger.error(`Erro ao remover usuário ID: ${id}`, err);
    throw new InternalServerErrorException('Erro ao excluir o usuário.');
  }
}

  async findByEmail(email: string) {
    try {
      return await this.prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });
    } catch (err) {
      this.logger.error(`Erro ao buscar usuário por e-mail: ${email}`, err);
      throw new InternalServerErrorException('Erro ao buscar usuário.');
    }
  }
}