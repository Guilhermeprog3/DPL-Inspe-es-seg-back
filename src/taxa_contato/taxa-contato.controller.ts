// src/taxa-contato/taxa-contato.controller.ts
import {
  Controller,
  Get,
  Patch,
  Delete,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { TaxaContatoService } from './TaxaContatoService';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('taxa-contato')
@UseGuards(JwtAuthGuard)
export class TaxaContatoController {
  constructor(private readonly taxaContatoService: TaxaContatoService) {}

  // Listagem filtrada por regional/role — tabela principal
  @Get()
  async getTaxa(
    @GetUser() user: any,
    @Query('competencia') competencia?: string,
    @Query('regional') regional?: string,
    @Query('area') area?: string,
    @Query('supervisor') supervisor?: string,
  ) {
    const queryFilters: any = {};
    if (competencia) queryFilters.competencia = competencia;
    if (regional)    queryFilters.regional    = regional;
    if (area)        queryFilters.area        = area;
    if (supervisor)  queryFilters.supervisor  = supervisor;

    return this.taxaContatoService.findAll(queryFilters, user);
  }

  // Listagem completa (sem filtro de regional) — modal de Associar
  @Get('todos')
  async getTodos(@GetUser() user: any) {
    return this.taxaContatoService.findAllForAssociation(user);
  }

  // ── PATCH /:id — atualização genérica de campos (codsituacao, nome, etc.)
  @Patch(':id')
  async updateOne(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Record<string, any>,
  ) {
    return this.taxaContatoService.updateOne(id, body);
  }

  // Associar / transferir colaborador
  @Patch(':id/assumir')
  async claim(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      supervisorName: string;
      supervisorEmail: string;
      area?: string;
      base?: string;
      regional?: string;
    },
  ) {
    return this.taxaContatoService.claimCollaborator(id, body);
  }

  // Liberar colaborador sem supervisor
  @Patch(':id/soltar')
  async release(@Param('id', ParseIntPipe) id: number) {
    return this.taxaContatoService.removeFromSupervision(id);
  }

  // Criar novo registro
  @Post()
  async create(@Body() body: Record<string, any>) {
    return this.taxaContatoService.createOne(body);
  }

  // Excluir registro
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.taxaContatoService.deleteOne(id);
  }
}