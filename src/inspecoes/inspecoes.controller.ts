import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Param, 
  Req, 
  UseGuards, 
  BadRequestException, 
  ForbiddenException 
} from '@nestjs/common';
import { InspecoesService } from './inspecoes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('inspecoes')
@UseGuards(JwtAuthGuard)
export class InspecoesController {
  constructor(private readonly inspecoesService: InspecoesService) {}

  @Post()
  async registrar(@Req() req: any, @Body() data: any) {
    this.checkInspecaoRole(req.user); // Valida Permissão
    
    const userId = req.user?.userId || req.user?.id || req.user?.sub; 
    
    if (!userId) {
      throw new BadRequestException('ID do Inspetor não encontrado no token.');
    }

    return this.inspecoesService.registrarInspecao(userId, data);
  }

  @Get()
  async listarTodas(@Req() req: any) {
    this.checkInspecaoRole(req.user); // Valida Permissão
    return this.inspecoesService.listarTodas();
  }

  @Get(':id')
  async buscarPorId(@Param('id') id: string, @Req() req: any) {
    this.checkInspecaoRole(req.user); // Valida Permissão
    return this.inspecoesService.buscarPorId(id);
  }

  @Get('ponto/:pontoId')
  async buscarPorPonto(@Param('pontoId') pontoId: string, @Req() req: any) {
    this.checkInspecaoRole(req.user); // Valida Permissão
    return this.inspecoesService.buscarHistoricoPorPonto(pontoId);
  }

  /**
   * Centraliza a lógica de permissão para Inspeções
   * Permite apenas Administradores e Inspetores
   */
  private checkInspecaoRole(user: any) {
    const rolesPermitidos = ['inspetor', 'ADM'];
    
    if (!user.role || !rolesPermitidos.includes(user.role)) {
      throw new ForbiddenException(
        'Acesso negado: Apenas Inspetores ou Administradores podem gerenciar inspeções.'
      );
    }
  }
}