import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreatePontoDto {
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @IsString()
  @IsNotEmpty()
  uf!: string;

  @IsString()
  @IsNotEmpty()
  regional!: string;

  @IsString()
  @IsNotEmpty()
  base!: string;

  @IsString()
  @IsNotEmpty()
  qrCode!: string;

  @IsUUID()
  @IsOptional()
  equipamentoAtualId?: string; // Aqui o '?' já resolve pois é opcional
}