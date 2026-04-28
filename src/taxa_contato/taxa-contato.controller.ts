// src/taxa-contato/taxa-contato.controller.ts
import { Controller, Get, Patch, Body, Param, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { TaxaContatoService } from './TaxaContatoService';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('taxa-contato')
@UseGuards(JwtAuthGuard)
export class TaxaContatoController {
  constructor(private readonly taxaContatoService: TaxaContatoService) {}

  @Get()
  async getTaxa(
    @Query('regional') regional?: string,
    @Query('area') area?: string,
    @Query('supervisor') supervisor?: string
  ) {
    const filters: any = {};
    if (regional) filters.regional = regional;
    if (area) filters.area = area;
    if (supervisor) filters.supervisor = supervisor;

    return this.taxaContatoService.findAll(filters);
  }

  @Patch(':id/assumir')
  async claim(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { supervisorName: string, supervisorEmail: string }
  ) {
    return this.taxaContatoService.claimCollaborator(id, body.supervisorName, body.supervisorEmail);
  }

  @Patch(':id/soltar')
  async release(@Param('id', ParseIntPipe) id: number) {
    return this.taxaContatoService.removeFromSupervision(id);
  }
}