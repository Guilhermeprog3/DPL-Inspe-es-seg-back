import { Injectable } from '@nestjs/common';
import { PrismaPfuncService } from '../prisma/prisma-pfunc.service';

@Injectable()
export class TaxaContatoService {
  constructor(private prismaPfunc: PrismaPfuncService) {}

  async buscarColaboradoresRecentes() {
    try {
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