import { PartialType } from '@nestjs/mapped-types';
import { IsUUID, IsOptional } from 'class-validator';
import { CreatePontoDto } from './create-ponto.dto';

export class UpdatePontoDto extends PartialType(CreatePontoDto) {
  /**
   * Para desvincular o equipamento, envie equipamentoAtualId: null.
   * Para vincular/trocar, envie o UUID do novo equipamento.
   * Para não alterar o vínculo, omita o campo.
   */
  @IsUUID()
  @IsOptional()
  equipamentoAtualId?: string | null;
}