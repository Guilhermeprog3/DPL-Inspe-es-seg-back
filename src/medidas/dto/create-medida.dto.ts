import {IsNotEmpty, IsString, 
  IsIn, 
  IsOptional, 
  IsInt, 
  Min } from 'class-validator';

export class CreateMedidaDto {
  @IsString() @IsNotEmpty()
  colaborador: string;

  @IsString() @IsNotEmpty()
  matricula: string;

  @IsString() @IsNotEmpty()
  supervisor: string;
  
  @IsString() @IsNotEmpty()
  nomeSupervisor: string

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

  @IsOptional() 
  @IsInt({ message: 'Os dias de suspensão devem ser um número inteiro' })
  @Min(1, { message: 'A suspensão deve ser de no mínimo 1 dia' })
  diasSuspensao?: number;
}