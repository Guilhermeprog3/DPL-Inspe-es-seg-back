import { Controller, Post, Get, Body, Param, Req, UseGuards,BadRequestException } from '@nestjs/common';
import { InspecoesService } from './inspecoes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('inspecoes')
@UseGuards(JwtAuthGuard) // Protege todas as rotas deste controller
export class InspecoesController {
  constructor(private readonly inspecoesService: InspecoesService) {}

@Post()
async registrar(@Req() req: any, @Body() data: any) {
  // Ajustado para pegar 'userId' que é o que seu Guard está injetando
  const userId = req.user?.userId || req.user?.id || req.user?.sub; 
  
  if (!userId) {
    throw new BadRequestException('ID do Inspetor não encontrado no token.');
  }

  return this.inspecoesService.registrarInspecao(userId, data);
}

  @Get()
  async listarTodas() {
    return this.inspecoesService.listarTodas();
  }

  @Get(':id')
async buscarPorId(@Param('id') id: string) {
  return this.inspecoesService.buscarPorId(id);
}

  @Get('ponto/:pontoId')
  async buscarPorPonto(@Param('pontoId') pontoId: string) {
    return this.inspecoesService.buscarHistoricoPorPonto(pontoId);
  }
}