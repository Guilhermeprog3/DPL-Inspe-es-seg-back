// src/users/users.service.ts
import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private readonly regionaisPermitidas = {
    PI: ['NORTE', 'SUL', 'METRO'],
    MA: ['NORTE', 'SUL', 'NORDESTE', 'SUDESTE']
  };

  async create(dto: CreateUserDto) {
    const validas = this.regionaisPermitidas[dto.uf];
    if (!validas || !validas.includes(dto.regional.toUpperCase())) {
      throw new BadRequestException(
        `Regional ${dto.regional} inválida para ${dto.uf}. Opções: ${validas?.join(', ')}`
      );
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    return this.prisma.user.create({
      data: {
        ...dto,
        regional: dto.regional.toUpperCase(),
        password: hashedPassword,
      },
      select: { // Remove a senha do retorno por segurança
        id: true,
        nome: true,
        email: true,
        role: true,
        uf: true,
        regional: true,
        ativo: true,
      }
    });
  }

  // MÉTODO FALTANTE: Busca todos os usuários
  async findAll() {
    return this.prisma.user.findMany({
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
  }

  // MÉTODO AUXILIAR: Busca por email para o login
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }
}