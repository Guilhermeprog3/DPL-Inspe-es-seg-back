import { Injectable } from '@nestjs/common';
import { PrismaPfuncService } from '../prisma/prisma-pfunc.service';

@Injectable()
export class TaxaContatoService {
  constructor(private prismaPfunc: PrismaPfuncService) {}

  // Renomeado para coincidir com o Controller
  async buscarColaboradoresRecentes() {
    try {
      // Busca na View dbo.vw_funcionarios pegando apenas chapa e nome
      const funcionarios = await this.prismaPfunc.vwFuncionario.findMany({
        select: {
          chapa: true,
          nome: true,
        },
        orderBy: {
          nome: 'asc',
        },
      });

      return funcionarios;
    } catch (error) {
      console.error('Erro ao buscar dados na View vw_funcionarios:', error);
      throw new Error('Não foi possível carregar a lista de funcionários.');
    }
  }
}