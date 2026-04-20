// src/medidas/medidas.controller.ts
import { Controller, Res, Post, Get, UploadedFiles, Body, Patch, Param, Delete, UseGuards, UseInterceptors, Req, ForbiddenException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MedidasService } from './medidas.service';
import { CreateMedidaDto } from './dto/create-medida.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('medidas')
@UseGuards(JwtAuthGuard)
export class MedidasController {
  constructor(private readonly medidasService: MedidasService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  async create(
    @Body() dto: CreateMedidaDto, 
    @Req() req,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    this.checkCobliRole(req.user);

    // Converte diasSuspensao para número se ele existir
    if (dto.diasSuspensao) {
      dto.diasSuspensao = Number(dto.diasSuspensao);
    }

    return this.medidasService.create(dto, req.user.userId, files);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    this.checkCobliRole(req.user);
    return this.medidasService.findOne(id);
  }

  @Get()
  async findAll(@Req() req) {
    this.checkCobliRole(req.user);
    return this.medidasService.findAllByRegional(
      req.user.userId, 
      req.user.role, 
      req.user.uf, 
      req.user.regional
    );
  }

  // MÉTODO UPDATE ATUALIZADO PARA SUPORTAR ARQUIVOS
  @Patch(':id')
  @UseInterceptors(FilesInterceptor('files')) // <-- Adicionado Interceptor
  async update(
    @Param('id') id: string, 
    @Body() dto: any, 
    @Req() req,
    @UploadedFiles() files: Express.Multer.File[] // <-- Adicionado Captura de arquivos
  ) {
    this.checkCobliRole(req.user);

    // Repetir a conversão caso venha pelo FormData no Update
    if (dto.diasSuspensao) {
      dto.diasSuspensao = Number(dto.diasSuspensao);
    }

    // Passar o array de files para o service processar o SFTP
    return this.medidasService.update(id, dto, req.user.userId, files);
  }

  @Get('anexo/:id')
async getAnexo(@Param('id') id: string, @Res() res: Response) {
  const anexo = await this.medidasService.findAnexoById(id);
  // Aqui você deve buscar o arquivo no SFTP e dar um pipe para o 'res'
  // Ou, se o arquivo estiver em uma pasta acessível pelo NestJS:
  // res.sendFile(anexo.url); 
}

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    this.checkCobliRole(req.user);
    return this.medidasService.remove(id, req.user.userId);
  }

  private checkCobliRole(user: any) {
    const rolesPermitidos = ['agente_cobli', 'admin'];
    if (!rolesPermitidos.includes(user.role)) {
      throw new ForbiddenException('Você não tem permissão para gerenciar medidas');
    }
  }
}