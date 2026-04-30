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
import { TaxaContatoService } from './TaxaContatoService'; // Certifique-se de que o nome do arquivo está correto
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('taxa-contato')
@UseGuards(JwtAuthGuard)
export class TaxaContatoController {
  constructor(private readonly taxaContatoService: TaxaContatoService) {}

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

  @Get('todos')
  async getTodos(@GetUser() user: any) {
    return this.taxaContatoService.findAllForAssociation(user);
  }

  // Adicionado @GetUser() para o Log
  @Patch(':id')
  async updateOne(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Record<string, any>,
    @GetUser() user: any, 
  ) {
    return this.taxaContatoService.updateOne(id, body, user);
  }

  // Adicionado @GetUser() para o Log
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
    @GetUser() user: any,
  ) {
    return this.taxaContatoService.claimCollaborator(id, body, user);
  }

  // Adicionado @GetUser() para o Log
  @Patch(':id/soltar')
  async release(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: any,
  ) {
    return this.taxaContatoService.removeFromSupervision(id, user);
  }

  // Adicionado @GetUser() para o Log
  @Post()
  async create(
    @Body() body: Record<string, any>,
    @GetUser() user: any,
  ) {
    return this.taxaContatoService.createOne(body, user);
  }

  // Adicionado @GetUser() para o Log
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: any,
  ) {
    return this.taxaContatoService.deleteOne(id, user);
  }
}