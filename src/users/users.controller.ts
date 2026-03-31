// src/users/users.controller.ts

import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    // A lógica de validação de Regional por UF já deve estar no Service
    return this.usersService.create(createUserDto);
  }

  @Get()
  // Aqui você poderá adicionar um Guard de Admin futuramente
  async findAll() {
    return this.usersService.findAll();
  }
}