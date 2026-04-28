// src/users/users.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Query,
  NotFoundException,
  HttpCode,
  HttpStatus,
  Param,
  Delete,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
// @UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
  @Patch(':id')
async update(@Param('id') id: string, @Body() updateData: any) {
  return this.usersService.update(id, updateData);
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
  @Get(':id')
async findOne(@Param('id') id: string) {
  return this.usersService.findOne(id);
}

@Delete(':id')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}