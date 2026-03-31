import { IsNotEmpty, IsString, IsIn } from 'class-validator';

export class CreateMedidaDto {
  @IsString() @IsNotEmpty()
  colaborador: string;

  @IsString() @IsNotEmpty()
  matricula: string;

  @IsString() @IsNotEmpty()
  supervisor: string;

  @IsIn(['SEGURANÇA', 'ADMINISTRATIVA'])
  tipo: string;

  @IsString() @IsNotEmpty()
  medida: string;

  @IsIn(['LEVE', 'MÉDIA', 'GRAVE', 'GRAVÍSSIMA'])
  gravidade: string;

  @IsString() @IsNotEmpty()
  classificacao: string;

  @IsString() @IsNotEmpty()
  ocorrencia: string;
}