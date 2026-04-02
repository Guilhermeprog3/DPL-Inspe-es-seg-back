import { Controller, Get, UseGuards } from '@nestjs/common';
import { TaxaContatoService } from './taxa-contato.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('taxa-contato')
export class TaxaContatoController {
  constructor(private readonly taxaContatoService: TaxaContatoService) {}

  @UseGuards(JwtAuthGuard)
  @Get('recentes')
  async listarRecentes() {
    return this.taxaContatoService.buscarColaboradoresRecentes();
  }
}