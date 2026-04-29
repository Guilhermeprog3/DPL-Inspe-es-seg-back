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

    // 1. Normalização e Definição de Roles
    const ufUpper = uf?.toUpperCase();
    const regionalUpper = regional?.toUpperCase();
    const roleLower = role.toLowerCase();
    
    // Gerente e Coordenador não precisam obrigatoriamente de uma regional específica
    const isCorporativa = ['gerente', 'coordenador'].includes(roleLower);

    // 2. Validação da UF (Obrigatória para todos)
    if (!this.regionaisPermitidas[ufUpper]) {
      throw new BadRequestException(
        `UF inválida: "${uf}". Permitidas: ${Object.keys(this.regionaisPermitidas).join(', ')}.`
      );
    }

    // 3. Validação da Regional (Apenas se NÃO for corporativa)
    if (!isCorporativa) {
      const regionaisValidas = this.regionaisPermitidas[ufUpper];
      if (!regionalUpper || !regionaisValidas.includes(regionalUpper)) {
        throw new BadRequestException(
          `Regional "${regional}" inválida para ${ufUpper}. Válidas: ${regionaisValidas.join(', ')}.`
        );
      }
    }

    // 4. Verificação de e-mail único
    const existente = await this.prisma.user.findUnique({ 
      where: { email: email.toLowerCase().trim() } 
    });
    if (existente) {
      throw new ConflictException('Este e-mail já está cadastrado.');
    }

    // 5. Hash da senha
    let hashedPassword: string;
    try {
      hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
      this.logger.error('Erro ao gerar hash da senha', err);
      throw new InternalServerErrorException('Erro ao processar a senha.');
    }

    // 6. Criação do usuário
    try {
      const user = await this.prisma.user.create({
        data: {
          nome: nome.trim(),
          sobrenome: sobrenome.trim(),
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          uf: ufUpper,
          // Se for corporativa, salvamos a regional enviada ou 'GERAL'
          regional: isCorporativa ? (regionalUpper || 'GERAL') : regionalUpper,
          role: roleLower,
          ativo: false,
        },
        select: {
          id: true,
          nome: true,
          sobrenome: true,
          email: true,
          role: true,
          uf: true,
          regional: true,
          ativo: true,
          criadoEm: true,
        },
      });

      return {
        message: 'Solicitação de acesso registrada com sucesso. Aguarde aprovação.',
        user,
      };
    } catch (err) {
      this.logger.error('Erro inesperado ao criar usuário', err);
      throw new InternalServerErrorException('Erro ao registrar o usuário.');
    }
  }

  async update(id: string, data: any) {
  try {
    const userExists = await this.prisma.user.findUnique({ where: { id } });
    if (!userExists) throw new NotFoundException('Usuário não encontrado');

    const updatePayload: Prisma.UserUpdateInput = {
      ...data,
    };

    if (data.ativo !== undefined) {
      updatePayload.ativo = Boolean(data.ativo);
    } else if (data.status !== undefined) {
      updatePayload.ativo = data.status === 'ativo';
    }

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