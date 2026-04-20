// src/users/users.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  NotFoundException,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('by-email')
  async findByEmail(@Query('email') email: string) {
    if (!email?.trim()) {
      throw new BadRequestException('O parâmetro "email" é obrigatório.');
    }

    const user = await this.usersService.findByEmail(email);
    if (!user) throw new NotFoundException('Usuário não encontrado.');

    return { uf: user.uf, regional: user.regional };
  }
}