// src/medidas/medidas.controller.ts
import { Controller, Post, Get, Body, Patch, Param,Delete, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { MedidasService } from './medidas.service';
import { CreateMedidaDto } from './dto/create-medida.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('medidas')
@UseGuards(JwtAuthGuard)
export class MedidasController {
  constructor(private readonly medidasService: MedidasService) {}

  @Post()
  async create(@Body() dto: CreateMedidaDto, @Req() req) {
    this.checkCobliRole(req.user);
    return this.medidasService.create(dto, req.user.userId);
  }
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    this.checkCobliRole(req.user); // Garante que apenas quem tem permissão acessa
    return this.medidasService.findOne(id);
  }

  @Get()
  async findAll(@Req() req) {
    this.checkCobliRole(req.user);
    return this.medidasService.findAllByUser(req.user.userId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: any, @Req() req) {
    this.checkCobliRole(req.user);
    return this.medidasService.update(id, dto, req.user.userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    this.checkCobliRole(req.user);
    return this.medidasService.remove(id, req.user.userId);
  }

  private checkCobliRole(user: any) {
    if (user.role !== 'agente_cobli') {
      throw new ForbiddenException('Apenas Agentes Cobli podem gerenciar medidas');
    }
  }
}