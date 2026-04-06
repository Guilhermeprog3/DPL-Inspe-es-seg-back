import { Controller, Post, Get, Body, Param, Req, UseGuards } from '@nestjs/common';
import { InspecoesService } from './inspecoes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('inspecoes')
@UseGuards(JwtAuthGuard) // Protege todas as rotas deste controller
export class InspecoesController {
  constructor(private readonly inspecoesService: InspecoesService) {}

  @Post()
  async registrar(@Req() req: any, @Body() data: any) {
    // O userId vem do token JWT decodificado pelo Guard
    const userId = req.user.id; 
    return this.inspecoesService.registrarInspecao(userId, data);
  }

  @Get()
  async listarTodas() {
    return this.inspecoesService.listarTodas();
  }

  @Get('ponto/:pontoId')
  async buscarPorPonto(@Param('pontoId') pontoId: string) {
    return this.inspecoesService.buscarHistoricoPorPonto(pontoId);
  }
}