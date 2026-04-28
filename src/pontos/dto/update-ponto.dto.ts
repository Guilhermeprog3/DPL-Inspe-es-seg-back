import { PartialType } from '@nestjs/mapped-types';
import { IsUUID, IsOptional } from 'class-validator';
import { CreatePontoDto } from './create-ponto.dto';

export class UpdatePontoDto extends PartialType(CreatePontoDto) {

  @IsUUID()
  @IsOptional()
  equipamentoAtualId?: string | null;
}