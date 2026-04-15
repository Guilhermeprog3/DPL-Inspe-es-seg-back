// src/medidas/medidas.controller.ts
import { Controller, Post, Get,UploadedFiles, Body, Patch, Param,Delete, UseGuards,UseInterceptors, Req, ForbiddenException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MedidasService } from './medidas.service';
import { CreateMedidaDto } from './dto/create-medida.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('medidas')
@UseGuards(JwtAuthGuard)
export class MedidasController {
  constructor(private readonly medidasService: MedidasService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files')) // 'files' deve ser o nome do campo no FormData do Frontend
  async create(
    @Body() dto: CreateMedidaDto, 
    @Req() req,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    this.checkCobliRole(req.user);
    // Passamos os arquivos recebidos para o service
    return this.medidasService.create(dto, req.user.userId, files);
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
  const rolesPermitidos = ['agente_cobli','admin'];
  
  if (!rolesPermitidos.includes(user.role)) {
    throw new ForbiddenException('Você não tem permissão para gerenciar medidas');
  }
}
}