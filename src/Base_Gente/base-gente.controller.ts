import { Controller, Get, UseGuards } from '@nestjs/common';
import { BaseGenteService } from './base-gente.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('base-gente')
export class BaseGenteController {
  constructor(private readonly baseGenteService: BaseGenteService) {}

  @UseGuards(JwtAuthGuard)
  @Get('recentes')
  async listarRecentes() {
    return this.baseGenteService.buscarColaboradoresRecentes();
  }
}